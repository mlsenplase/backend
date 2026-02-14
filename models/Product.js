import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
const productSchema = new mongoose.Schema(
  image: String,
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

