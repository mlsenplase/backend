import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        quantity: Number
      }
    ],
    total: Number,
    status: {
      type: String,
      default: "pendente"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
