import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { ingest } from '@/config/ingest';

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

        const { address, items } = await request.json();

        if (!address || !items || items.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid data',
                },
                {
                    status: 400,
                }
            );
        }

        // Calculate amount using items
        let amount = await items.reduce(
            async (previousAmountPromise, item) => {

                const previousAmount = await previousAmountPromise;

                const product = await Product.findById(item.product);

                if (!product) {
                    throw new Error(
                        `Product not found: ${item.product}`
                    );
                }

                return previousAmount +
                    product.offerPrice * item.quantity;
            },
            Promise.resolve(0)
        );

        // Add 2% tax
        amount = Math.floor(
            (amount + amount * 0.02) * 100
        ) / 100;

        // Create order event in Inngest
        await ingest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                amount,
                date: Date.now(),
            },
        });

        // Clear user's cart
        await connectDB();

        const user = await User.findById(userId);

        if (user) {
            user.cartItems = {};
            await user.save();
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Order placed successfully',
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.error('Create order error:', error);

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