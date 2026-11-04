import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import authSeller from '@/lib/authSeller';
import connectDB from '@/config/db';
import Product from '@/models/Product';
import { parseSizes } from '@/lib/commerce.mjs';
export async function PATCH(request) {
  const { userId } = await auth();
  if (!userId || !await authSeller(userId)) return NextResponse.json({ success: false }, { status: 403 });
  try {
    const { productId, sizes } = await request.json();
    if (typeof productId !== 'string' || !/^[a-f0-9]{24}$/i.test(productId)) throw new Error('Invalid product');
    const checked = parseSizes(sizes);
    await connectDB();
    const product = await Product.findOneAndUpdate({ _id: productId, userId }, { $set: { sizes: checked } }, { new: true });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, message: 'Unable to update sizes. Check the size labels and retry.' }, { status: 400 }); }
}
