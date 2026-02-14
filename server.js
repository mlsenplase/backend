import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.error(err));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API Profissional rodando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});


app.post("/register", async (req, res) => {
  try {
    const { nome, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = new User({
      nome,
      senha: senhaHash
    });

    await novoUsuario.save();

    res.json("Usuário criado com sucesso");
  } catch (err) {
    res.status(500).json(err.message);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { nome, senha } = req.body;

    const usuario = await User.findOne({ nome });
    if (!usuario)
      return res.status(400).json("Usuário não encontrado");

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida)
      return res.status(400).json("Senha incorreta");

    const token = jwt.sign(
      { id: usuario._id, isAdmin: usuario.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
