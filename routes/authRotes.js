import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/admin", protect, adminOnly, (req, res) => {
  res.json("Área admin segura 🔒");
});

export default router;
