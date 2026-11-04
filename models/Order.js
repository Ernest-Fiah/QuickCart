import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    paymentReference: String,
    paymentStatus: String,
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

            size: { type: String, default: '' },
            name: String,
            unitPrice: Number,
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
        default: 'Order Placed'
    },

    date: {
        type: Number,
        required: true
    }
});

const Order =
    mongoose.models.Order ||
    mongoose.model('Order', OrderSchema);

export default Order;
