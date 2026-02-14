import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
app.use("/api/products", productRoutes);

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://mstore-frontend-seven.vercel.app"
];

app.use(cors({
  origin: (origin, cb) => {
    // permite Postman/cURL (sem origin) e os sites permitidos
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // usando Bearer token, não precisa cookie
  optionsSuccessStatus: 204
}));

// responde preflight (IMPORTANTÍSSIMO)
app.options("*", cors());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mstore-frontend-seven.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.error("Erro Mongo:", err.message));

app.get("/", (req, res) => res.send("API online ✅"));

// ✅ suas rotas aqui (depois do app existir)
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));