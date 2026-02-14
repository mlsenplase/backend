import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`Missing env: ${name}`);
  return process.env[name];
}

router.post("/misticpay/create", protect, async (req, res) => {
  try {
    const { orderId, payerName, payerDocument } = req.body;

    if (!orderId || !payerName || !payerDocument) {
      return res.status(400).json({ message: "orderId, payerName, payerDocument são obrigatórios" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Pedido não encontrado" });

    // só dono do pedido pode pagar (ou admin, se quiser permitir)
    if (String(order.userId) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Sem permissão para pagar este pedido" });
    }

    // se já tem transação, reaproveita
    if (order.misticpayTransactionId && order.status === "aguardando_pix") {
      return res.json({
        orderId: order._id,
        transactionId: order.misticpayTransactionId,
        copyPaste: order.pixCopyPaste,
        qrCodeBase64: order.pixQrCodeBase64
      });
    }

    const ci = requireEnv("MISTICPAY_CI");
    const cs = requireEnv("MISTICPAY_CS");
    const publicUrl = requireEnv("PUBLIC_URL");
    const webhookSecret = requireEnv("MISTICPAY_WEBHOOK_SECRET");

    // webhook por pedido (opcional na doc)
    // projectWebhook é suportado (opcional) :contentReference[oaicite:2]{index=2}
    const projectWebhook = `${publicUrl}/api/payments/misticpay/webhook?secret=${encodeURIComponent(webhookSecret)}`;

    const body = {
      amount: Number(order.total),
      payerName,
      payerDocument, // sem formatação: "12345678909" :contentReference[oaicite:3]{index=3}
      transactionId: String(order._id), // seu id interno pra identificar :contentReference[oaicite:4]{index=4}
      description: `Pedido ${order._id}`,
      projectWebhook
    };

    const resp = await fetch("https://api.misticpay.com/api/transactions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ci,
        cs
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return res.status(502).json({ message: "Erro ao criar transação na MisticPay", details: data });
    }

    // resposta inclui transactionId, qrCodeBase64, copyPaste etc :contentReference[oaicite:5]{index=5}
    const tx = data?.data;

    order.misticpayTransactionId = String(tx?.transactionId ?? "");
    order.pixQrCodeBase64 = tx?.qrCodeBase64 ?? null;
    order.pixCopyPaste = tx?.copyPaste ?? null;
    order.status = "aguardando_pix";
    await order.save();

    return res.json({
      orderId: order._id,
      transactionId: order.misticpayTransactionId,
      copyPaste: order.pixCopyPaste,
      qrCodeBase64: order.pixQrCodeBase64
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Webhook de depósito: status COMPLETO/FALHA/PENDENTE :contentReference[oaicite:6]{index=6}
router.post("/misticpay/webhook", async (req, res) => {
  try {
    const secret = req.query.secret;
    if (!secret || secret !== process.env.MISTICPAY_WEBHOOK_SECRET) {
      return res.status(401).json({ message: "Unauthorized webhook" });
    }

    const { transactionId, status } = req.body || {};
    if (!transactionId) return res.status(400).json({ message: "transactionId obrigatório" });

    const order = await Order.findOne({ misticpayTransactionId: String(transactionId) });
    if (!order) return res.status(404).json({ message: "Pedido não encontrado para esta transação" });

    if (status === "COMPLETO") {
      order.status = "pago";
      await order.save();
    } else if (status === "FALHA") {
      order.status = "cancelado";
      await order.save();
    }

    // sempre responde 200 pro webhook não ficar retry infinito
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
