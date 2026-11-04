import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ success: false, message: 'Please complete Paystack checkout to place your order.' }, { status: 410 });
}
