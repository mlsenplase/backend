iimport express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

// ✅ CORS (sem barra no final!)
const allowedOrigins = [
  "http://localhost:5173",
  "https://mstore-frontend-seven.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite ferramentas sem origin (Postman/cURL) e as origens permitidas
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204
}));

// ✅ Preflight
app.options("*", cors());

app.use(helmet());
app.use(express.json()); // ✅ necessário para ler JSON
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("API online ✅");
});

// Exemplo de login (teste)
app.post("/api/auth/login", async (req, res) => {
  res.json({ token: "teste", role: "admin" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
