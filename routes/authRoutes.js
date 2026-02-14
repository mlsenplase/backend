import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

/* AUTH */
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

/* ADMIN CHECK */
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ ok: true });
});

/* LISTAR USERS */
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({}, { senha: 0 }).sort({ createdAt: -1 });
  res.json(users);
});

/* ALTERAR ROLE */
router.patch("/users/:id/role", protect, adminOnly, async (req, res) => {
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Role inválida" });
  }

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, projection: { senha: 0 } }
  );

  res.json(updated);
});

/* LOGS */
router.get("/logs", protect, adminOnly, async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
  res.json(logs);
});

export default router;
