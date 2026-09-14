import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: true,
        unique: true
    },

    userId: {
        type: String,
        required: true,
        ref: 'User'
    },

    items: [
        {
            product: {
                type: String,
                required: true,
                ref: 'Product'
            },

            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    amount: {
        type: Number,
        required: true
    },

    address: {
        type: String,
        required: true,
        ref: 'Address'
    },

    status: {
        type: String,
        required: true,
        default: 'pending'
    },

    date: {
        type: Number,
        required: true
    }
});

const Payment =
    mongoose.models.Payment ||
    mongoose.model('Payment', PaymentSchema);

export default Payment;