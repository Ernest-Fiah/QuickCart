import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { getAvailableSizes, needsSize, makeCartKey, parseCartKey } from "@/lib/sizing.mjs";
import { applyCartMutation, clearCartItems } from "@/lib/cartMutations.mjs";
import mongoose from "mongoose";

const badRequest = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return badRequest("Please sign in.", 401);

    const body = await request.json();
    await connectDB();

    if (body?.action === "clear") {
      // Clear only the authenticated customer's persisted cart. This action
      // intentionally bypasses product validation so obsolete items can be
      // removed even when a product/size no longer exists.
      const updated = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { cartItems: clearCartItems() }, $inc: { __v: 1 } },
        { new: true }
      ).lean();
      if (!updated) return badRequest("Account not found.", 404);
      return NextResponse.json({ success: true, cartItems: updated.cartItems || {} });
    }

    // Incremental updates only validate the selected item. Before this change,
    // adding a valid size submitted and revalidated the ENTIRE saved cart. Any
    // legacy/no-size item from an earlier website version blocked new additions.
    if (body?.action === "add" || body?.action === "set") {
      const productId = String(body.productId || "");
      const size = String(body.size ?? "").trim();
      if (!mongoose.isValidObjectId(productId) || size.length > 30)
        return badRequest("Invalid product or size.");

      // Allow a customer to remove an obsolete cart item even when its
      // product is inactive or its old size is no longer available.
      if (body.action === "add" || body.quantity !== 0) {
        const product = await Product.findById(productId).lean();
        if (!product || product.isActive === false)
          return badRequest("This product is no longer available.");
        const available = getAvailableSizes(product);
        if ((needsSize(product) && !available.includes(size)) ||
            (!needsSize(product) && size)) {
          return NextResponse.json({
            success: false,
            message: `Please select an available size for ${product.name}.`,
            availableSizes: available,
          }, { status: 400 });
        }
      }

      const key = makeCartKey(productId, size);
      // Optimistic version check prevents one device from silently replacing
      // another device's cart update. Handles old users missing __v, too.
      for (let attempt = 0; attempt < 4; attempt++) {
        const user = await User.findById(userId).lean();
        if (!user) return badRequest("Account not found.", 404);

        let nextCart;
        try {
          nextCart = applyCartMutation(user.cartItems, key, body.action, body.quantity);
        } catch (error) {
          return badRequest(error.message);
        }
        const versionFilter = Number.isSafeInteger(user.__v)
          ? { __v: user.__v } : { __v: { $exists: false } };
        const saved = await User.findOneAndUpdate(
          { _id: userId, ...versionFilter },
          { $set: { cartItems: nextCart }, $inc: { __v: 1 } },
          { new: true }
        ).lean();
        if (saved) return NextResponse.json({ success: true, cartItems: saved.cartItems || nextCart });
      }
      return badRequest("Your cart changed on another device. Please try again.", 409);
    }

    // Legacy full-cart endpoint retained for older versions of the app.
    const { cartItems } = body;
    if (!cartItems || typeof cartItems !== "object" || Array.isArray(cartItems) ||
        Object.keys(cartItems).length > 60)
      return badRequest("Invalid cart.");
    for (const [key, quantity] of Object.entries(cartItems)) {
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 25)
        return badRequest("Quantity must be between 1 and 25.");
      const { productId, size } = parseCartKey(key);
      if (!mongoose.isValidObjectId(productId)) return badRequest("Invalid product.");
      const product = await Product.findById(productId).lean();
      if (!product || product.isActive === false || (needsSize(product) && !getAvailableSizes(product).includes(size)) ||
          (!needsSize(product) && size))
        return badRequest(`Please select a valid size for ${product?.name || "your product"}.`);
    }
    const result = await User.updateOne({ _id: userId }, { $set: { cartItems } });
    if (!result.matchedCount) return badRequest("Account not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart update:", error);
    return badRequest("Unable to update cart.", 500);
  }
}
