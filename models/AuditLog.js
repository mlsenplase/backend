import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // "login_success", "login_fail", "user_role_change", etc
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    nome: { type: String, default: "" }, // útil quando falha antes de achar user
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
