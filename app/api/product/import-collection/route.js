import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";
import { MORVEN_NEW_COLLECTION, MORVEN_COLLECTION_KEYS } from "@/lib/morvenNewCollection.mjs";
import { getCategorySizeOptions } from "@/lib/sizing.mjs";

export const runtime = "nodejs";

async function authorizedSeller() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ success: false, message: "Sign in first." }, { status: 401 }) };
  if (!(await authSeller(userId)))
    return { error: NextResponse.json({ success: false, message: "Seller access required." }, { status: 403 }) };
  return { userId };
}

function fail(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function parseInput(form) {
  const key = String(form.get("sourceKey") || "");
  const source = MORVEN_NEW_COLLECTION.find(item => item.sourceKey === key);
  if (!source) throw new Error("Image is not part of the Morven 20-photo collection.");

  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const price = Number(form.get("price"));
  const offerPrice = Number(form.get("offerPrice"));
  let sizes = [];
  try { sizes = JSON.parse(String(form.get("availableSizes") || "[]")); }
  catch { throw new Error("Invalid size selection."); }
  const allowed = getCategorySizeOptions(source.category);

  if (name.length < 3 || name.length > 140 || description.length < 20 || description.length > 2000)
    throw new Error("Please enter a product name (3–140) and description (20–2000 characters).");
  if (!Number.isFinite(price) || !Number.isFinite(offerPrice) ||
      price <= 0 || offerPrice <= 0 || price > 100000 || offerPrice > price ||
      Math.abs(Math.round(price * 100) - price * 100) > 0.00001 ||
      Math.abs(Math.round(offerPrice * 100) - offerPrice * 100) > 0.00001)
    throw new Error("Enter valid GH₵ prices, with the offer price not exceeding the regular price.");
  if (!Array.isArray(sizes) || sizes.length === 0 || sizes.length > allowed.length ||
      sizes.some(size => typeof size !== "string" || !allowed.includes(size)))
    throw new Error("Choose the actual available sizes for this garment.");
  return {
    source, name, description, price, offerPrice, availableSizes: [...new Set(sizes)],
  };
}

async function cloudinaryUpload(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "morven/collection-2026-11", overwrite: false },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    stream.end(buffer);
  });
}

// One upload per request keeps Cloudinary operations within short serverless limits.
export async function POST(request) {
  try {
    const seller = await authorizedSeller();
    if (seller.error) return seller.error;
    const form = await request.formData();
    let draft;
    try { draft = parseInput(form); }
    catch (error) { return fail(error.message); }
    await connectDB();

    const existing = await Product.findOne({
      userId: seller.userId, collectionSourceKey: draft.source.sourceKey,
    });
    // Retry-safe: already uploaded photos are reused instead of charging for another upload.
    let image = existing?.image?.[0];
    if (!image || !/^https:\/\/res\.cloudinary\.com\//.test(image)) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)
        return fail("Cloudinary is not configured.", 503);
      const file = form.get("image");
      if (!file || typeof file.arrayBuffer !== "function" || file.type !== "image/webp" ||
          !Number.isInteger(file.size) || file.size < 1000 || file.size > 4_000_000)
        return fail("A valid prepared WebP image (under 4 MB) is required.");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      image = await cloudinaryUpload(file);
    }

    const saved = await Product.findOneAndUpdate(
      { userId: seller.userId, collectionSourceKey: draft.source.sourceKey },
      {
        $set: {
          name: draft.name, description: draft.description, category: draft.source.category,
          price: draft.price, offerPrice: draft.offerPrice,
          availableSizes: draft.availableSizes, image: [image],
        },
        $setOnInsert: {
          userId: seller.userId, date: Date.now(), isActive: false,
          collectionSourceKey: draft.source.sourceKey,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ success: true, productId: String(saved._id), prepared: true });
  } catch (error) {
    console.error("Morven collection image import failed:", error);
    return fail("Could not prepare this product. Please retry.", 500);
  }
}

// Finalize all 20 as one catalog switch; old records are archived, never deleted.
export async function PATCH(request) {
  try {
    const seller = await authorizedSeller();
    if (seller.error) return seller.error;
    const { confirmation } = await request.json();
    if (confirmation !== "REPLACE OLD CATALOG")
      return fail("Please confirm the full catalog replacement.");

    await connectDB();
    const imported = await Product.find({
      userId: seller.userId,
      collectionSourceKey: { $in: MORVEN_COLLECTION_KEYS },
    }).lean();
    const found = new Set(imported.map(item => item.collectionSourceKey));
    if (imported.length !== MORVEN_COLLECTION_KEYS.length ||
        !MORVEN_COLLECTION_KEYS.every(key => found.has(key)))
      return fail("Not all 20 product images have been prepared. Finish the import first.", 409);
    for (const p of imported) {
      if (!Array.isArray(p.availableSizes) || !p.availableSizes.length ||
          !(p.offerPrice > 0) || !(p.price >= p.offerPrice) ||
          !Array.isArray(p.image) || !/^https:\/\/res\.cloudinary\.com\//.test(p.image[0] || ""))
        return fail("Some product entries are missing sizes, prices or uploaded photos.", 409);
    }

    // This migration must not leave half the shop showing old items and half new ones.
    const mongoose = (await import("mongoose")).default;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Product.updateMany(
          { userId: seller.userId, collectionSourceKey: { $nin: MORVEN_COLLECTION_KEYS } },
          { $set: { isActive: false } },
          { session }
        );
        await Product.updateMany(
          { userId: seller.userId, collectionSourceKey: { $in: MORVEN_COLLECTION_KEYS } },
          { $set: { isActive: true } },
          { session }
        );
      });
    } finally { await session.endSession(); }
    return NextResponse.json({
      success: true, published: MORVEN_COLLECTION_KEYS.length,
      message: "All 20 Morven products are live. The previous catalog is archived.",
    });
  } catch (error) {
    console.error("Morven catalog publication failed:", error);
    return fail("The catalog could not be switched. Previous products remain unchanged if the transaction failed.", 500);
  }
}

export async function GET() {
  try {
    const seller = await authorizedSeller();
    if (seller.error) return seller.error;
    await connectDB();
    const products = await Product.find({
      userId: seller.userId,
      collectionSourceKey: { $in: MORVEN_COLLECTION_KEYS },
    }).select("collectionSourceKey isActive image name price offerPrice availableSizes").lean();
    return NextResponse.json({
      success: true,
      uploaded: products.map(p => ({
        sourceKey: p.collectionSourceKey, active: p.isActive !== false,
        price: p.price, offerPrice: p.offerPrice,
        name: p.name, availableSizes: p.availableSizes,
      })),
    });
  } catch (error) {
    console.error("Morven import status failed:", error);
    return fail("Could not retrieve import progress.", 500);
  }
}
