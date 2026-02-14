import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Listar
router.get("/", protect, adminOnly, async (req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json(items);
});

// Criar
router.post("/", protect, adminOnly, async (req, res) => {
  const { title, description, price, active } = req.body;
  const item = await Product.create({ title, description, price, active });
  res.status(201).json(item);
});

// Editar
router.put("/:id", protect, adminOnly, async (req, res) => {
  const { title, description, price, active } = req.body;
  const item = await Product.findByIdAndUpdate(
    req.params.id,
    { title, description, price, active },
    { new: true }
  );
  res.json(item);
});

// Deletar
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
