import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Payment from '@/models/Payment';

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

        // Connect to MongoDB
        await connectDB();

        // Get user
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

        if (!user.email) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User email not found',
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

                if (!item.quantity || item.quantity <= 0) {
                    throw new Error(
                        `Invalid quantity for product: ${item.product}`
                    );
                }

                return (
                    previousAmount +
                    product.offerPrice * item.quantity
                );
            },
            Promise.resolve(0)
        );

        // Add 2% tax
        amount =
            Math.floor(
                (amount + amount * 0.02) * 100
            ) / 100;

        // Convert Ghana Cedis to Pesewas
        const amountInPesewas = Math.round(
            amount * 100
        );

        const callbackUrl =
            `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;

        // Initialize Paystack payment
        const response = await fetch(
            'https://api.paystack.co/transaction/initialize',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    amount: amountInPesewas,
                    currency: 'GHS',
                    callback_url: callbackUrl,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        data.message ||
                        'Unable to initialize Paystack payment',
                },
                {
                    status: 400,
                }
            );
        }

        // Save payment information before redirecting
        await Payment.create({
            reference: data.data.reference,
            userId,
            address,
            items,
            amount,
            status: 'pending',
            date: Date.now(),
        });

        return NextResponse.json(
            {
                success: true,
                authorization_url:
                    data.data.authorization_url,
                reference: data.data.reference,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            'Paystack initialization error:',
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    'Something went wrong',
            },
            {
                status: 500,
            }
        );
    }
}