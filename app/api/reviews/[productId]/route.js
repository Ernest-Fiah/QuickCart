import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import Product from "@/models/Product";

const invalidProduct = () => NextResponse.json(
  { success: false, message: "Invalid product." }, { status: 400 }
);

export async function GET(request, { params }) {
  try {
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) return invalidProduct();
    await connectDB();
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(40)
      .select("rating comment displayName verifiedPurchase createdAt")
      .lean();
    const [summary] = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } },
    ]);
    const { userId } = await auth();
    const canReview = userId ? Boolean(await Order.exists({
      userId,
      paymentStatus: "paid",
      "items.product": productId,
    })) : false;
    const hasReviewed = userId ? Boolean(await Review.exists({ userId, productId })) : false;
    return NextResponse.json({
      success: true, reviews,
      count: summary?.count || 0,
      average: summary?.average || 0,
      canReview: canReview && !hasReviewed,
      hasReviewed,
    });
  } catch (error) {
    console.error("Review listing error:", error);
    return NextResponse.json({ success: false, message: "Unable to load reviews." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: "Please sign in." }, { status: 401 });
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) return invalidProduct();
    const body = await request.json();
    const rating = Number(body?.rating);
    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 15 || comment.length > 800)
      return NextResponse.json({ success: false, message: "Choose 1–5 stars and write 15–800 characters." }, { status: 400 });
    await connectDB();
    const itemExists = await Product.exists({ _id: productId });
    if (!itemExists) return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    const purchased = await Order.exists({
      userId,
      paymentStatus: "paid",
      "items.product": productId,
    });
    if (!purchased) return NextResponse.json({
      success: false, message: "Reviews are available after a confirmed purchase."
    }, { status: 403 });
    const exists = await Review.exists({ productId, userId });
    if (exists) return NextResponse.json({
      success: false, message: "You have already reviewed this product."
    }, { status: 409 });
    await Review.create({
      productId, userId, rating, comment,
      displayName: "Verified customer", verifiedPurchase: true,
    });
    return NextResponse.json({ success: true, message: "Thank you for sharing your review." }, { status: 201 });
  } catch (error) {
    if (error.code === 11000)
      return NextResponse.json({ success: false, message: "You have already reviewed this product." }, { status: 409 });
    console.error("Review creation error:", error);
    return NextResponse.json({ success: false, message: "Unable to submit review." }, { status: 500 });
  }
}
