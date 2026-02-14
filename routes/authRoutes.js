import User from "../models/User.js";
import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({}, { senha: 0 }); // remove senha do retorno
  res.json(users);
});

router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ ok: true, message: "Admin OK" });
});

export default router;