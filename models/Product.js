
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    offerPrice: {
        type: Number,
        required: true
    },

    image: {
        type: Array,
        required: true
    },

    availableSizes: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    collectionSourceKey: { type: String, default: undefined },

    category: {
        type: String,
        required: true
    },

    date: {
        type: Number,
        required: true
    }
});

ProductSchema.index({ userId: 1, collectionSourceKey: 1 }, { unique: true, partialFilterExpression: { collectionSourceKey: { $type: 'string' } } });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;

