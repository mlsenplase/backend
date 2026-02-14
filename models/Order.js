import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],

    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pendente", "pago", "entregue", "cancelado"],
      default: "pendente"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
