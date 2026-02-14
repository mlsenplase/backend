import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
ADMIN - LISTAR TODOS
=====================
*/
router.get("/", protect, adminOnly, async (req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json(items);
});

/*
=====================
ADMIN - CRIAR (com upload opcional)
=====================
*/
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, active } = req.body;

    let image = "";

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "mstore" },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      image = uploadResult.secure_url;
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      active: active === "false" ? false : true,
      image
    });

    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/*
=====================
ADMIN - EDITAR
=====================
*/
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/*
=====================
ADMIN - DELETAR
=====================
*/
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
