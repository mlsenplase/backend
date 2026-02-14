import User from "../models/User.js";
import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import AuditLog from "../models/AuditLog.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({}, { senha: 0 }); // remove senha do retorno
  res.json(users);
  router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({}, { senha: 0 }).sort({ createdAt: -1 });
  res.json(users);
  router.patch("/users/:id/role", protect, adminOnly, async (req, res) => {
  const { role } = req.body; // "admin" ou "user"
  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Role inválida" });
  }

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, projection: { senha: 0 } }
  );

  await AuditLog.create({
    type: "user_role_change",
    userId: req.user.id, // admin que fez a ação
    nome: "admin_action",
    meta: { targetUserId: req.params.id, newRole: role }
  });

  res.json(updated);
  router.get("/logs", protect, adminOnly, async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
  res.json(logs);
});

});

});

});

router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ ok: true, message: "Admin OK" });
});

export default router;