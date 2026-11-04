import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { parseCartKey, validateItem } from '@/lib/commerce.mjs';

export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not authenticated',
                },
                {
                    status: 401,
                }
            );
        }

        const { cartItems } = await request.json();

        if (!cartItems) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cart items are required',
                },
                {
                    status: 400,
                }
            );
        }

        await connectDB();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                {
                    status: 404,
                }
            );
        }

        if (typeof cartItems !== 'object' || Array.isArray(cartItems) || Object.keys(cartItems).length > 100) return NextResponse.json({ success: false, message: 'Invalid basket' }, { status: 400 });
        try {
            for (const [key, quantity] of Object.entries(cartItems)) {
                const line = parseCartKey(key);
                const product = await Product.findById(line.product);
                // Existing unsized lines can be removed, but checkout will reject them.
                if (!line.size && user.cartItems?.[key] === quantity) continue;
                validateItem({ ...line, quantity }, product);
            }
        } catch (error) { return NextResponse.json({ success: false, message: error.message }, { status: 400 }); }
        user.cartItems = cartItems;

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: 'Cart updated successfully',
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.error('Cart update error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Something went wrong',
            },
            {
                status: 500,
            }
        );
    }
}
