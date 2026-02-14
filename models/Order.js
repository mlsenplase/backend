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
      enum: ["pendente", "aguardando_pix", "pago", "cancelado"],
      default: "pendente"
    },

    // ✅ MisticPay
    paymentProvider: { type: String, default: "misticpay" },
    misticpayTransactionId: { type: String, default: null },
    pixCopyPaste: { type: String, default: null },
    pixQrCodeBase64: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
