import express from "express";
import Order from "../models/Order.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Criar pedido */
router.post("/", protect, async (req, res) => {
  const { products, total } = req.body;

  const order = await Order.create({
    userId: req.user.id,
    products,
    total
  });

  res.status(201).json(order);
});

/* Meus pedidos */
router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

/* Admin: listar todos */
router.get("/", protect, adminOnly, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

export default router;
