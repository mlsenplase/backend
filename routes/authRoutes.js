import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { register, login, logout } from "../controllers/authController.js";

const router = express.Router();

// auth básico
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);


// check admin
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ ok: true, message: "Admin OK" });
});

// listar usuários (sem senha)
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({}, { senha: 0 }).sort({ createdAt: -1 });
  res.json(users);
});

// mudar role
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

  if (!updated) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  await AuditLog.create({
    type: "user_role_change",
    userId: req.user.id, // admin que executou
    nome: "admin_action",
    meta: { targetUserId: req.params.id, newRole: role }
  });

  res.json(updated);
});

// logs (últimos 200)
router.get("/logs", protect, adminOnly, async (req, res) => {
  const { type, nome } = req.query;

  const q = {};
  if (type) q.type = type;
  if (nome) q.nome = { $regex: String(nome), $options: "i" };

  const logs = await AuditLog.find(q).sort({ createdAt: -1 }).limit(200);
  res.json(logs);
});
export default router;
