import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 800 },
  displayName: { type: String, default: "Verified customer" },
  verifiedPurchase: { type: Boolean, default: true },
}, { timestamps: true });

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;
