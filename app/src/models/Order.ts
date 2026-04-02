import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],

  totalAmount: {
    type: Number,
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING",
  },

  orderStatus: {
    type: String,
    enum: ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED",],
    default: "PLACED",
  },

  statusHistory: {
    type: [
      {
        status: {
          type: String,
          enum: ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },

  deliveryAddress: {
    type: String,
    required: true,
  },

}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);