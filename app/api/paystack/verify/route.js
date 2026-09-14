import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { inngest } from '@/config/inngest';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const reference = searchParams.get('reference');

        if (!reference) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Payment reference is required',
                },
                {
                    status: 400,
                }
            );
        }

        // Verify the Paystack transaction
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        data.message ||
                        'Unable to verify payment',
                },
                {
                    status: 400,
                }
            );
        }

        // Check Paystack payment status
        if (data.data.status !== 'success') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Payment was not successful',
                    status: data.data.status,
                },
                {
                    status: 400,
                }
            );
        }

        // Connect to MongoDB
        await connectDB();

        // Find the saved payment
        const payment = await Payment.findOne({
            reference,
        });

        if (!payment) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Payment record not found',
                },
                {
                    status: 404,
                }
            );
        }

        // Prevent duplicate order creation
        if (payment.status === 'success') {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Payment already verified',
                },
                {
                    status: 200,
                }
            );
        }

        // Verify currency
        if (data.data.currency !== 'GHS') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Payment currency is invalid',
                },
                {
                    status: 400,
                }
            );
        }

        // Verify amount
        const expectedAmount = Math.round(
            payment.amount * 100
        );

        if (data.data.amount !== expectedAmount) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Payment amount does not match order amount',
                },
                {
                    status: 400,
                }
            );
        }

        // Create the order through Inngest
        await inngest.send({
            name: 'order/created',

            data: {
                userId: payment.userId,
                address: payment.address,
                items: payment.items,
                amount: payment.amount,
                date: payment.date,
            },
        });

        // Clear user's cart
        const user = await User.findById(payment.userId);

        if (user) {
            user.cartItems = {};
            await user.save();
        }

        // Mark payment as successful
        payment.status = 'success';
        await payment.save();

        return NextResponse.json(
            {
                success: true,
                message: 'Payment verified successfully',
                data: data.data,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            'Paystack verification error:',
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