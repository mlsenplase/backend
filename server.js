import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://mstore-frontend-seven.vercel.app"
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.error("Erro Mongo:", err.message));

app.get("/", (req, res) => res.send("API online ✅"));

// ✅ rotas (depois do app existir)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
