import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";

function isProd() {
  return process.env.NODE_ENV === "production";
}

export const register = async (req, res) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ message: "Nome e senha são obrigatórios" });
    }

    const userExists = await User.findOne({ nome });
    if (userExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await User.create({
      nome,
      senha: senhaHash,
      role: "user"
    });

    return res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ message: "Nome e senha são obrigatórios" });
    }

    const user = await User.findOne({ nome });
    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(400).json({ message: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Cookie HttpOnly
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd(),         // true em produção (https)
      sameSite: "lax",          // bom padrão
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.json({ ok: true, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ ok: true });
};
