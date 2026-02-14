import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    senha: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
