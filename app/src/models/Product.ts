import mongoose, { models, Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
        unit: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = models.product || mongoose.model("Product", productSchema);