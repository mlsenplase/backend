import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=====================
ROTA PÚBLICA
=====================
*/
router.get("/public", async (req, res) => {
  const items = await Product.find({ active: true }).sort({ createdAt: -1 });
  res.json(items);
});

/*
=====================
ADMIN
=====================
*/

// listar todos (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json(items);
});

// criar
router.post("/", protect, adminOnly, async (req, res) => {
  const { title, description, price } = req.body;

  const product = await Product.create({
    title,
    description,
    price
  });

  res.status(201).json(product);
});

// editar
router.put("/:id", protect, adminOnly, async (req, res) => {
  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

// deletar
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
