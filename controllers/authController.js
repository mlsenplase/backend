import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuditLog from "../models/AuditLog.js";

export const register = async (req, res) => {
  try {
    const { nome, senha } = req.body;

    const userExists = await User.findOne({ nome });
    if (userExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const user = await User.create({
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
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
const userAgent = req.headers["user-agent"] || "";

if (!user) {
  await AuditLog.create({ type: "login_fail", nome, ip, userAgent, meta: { reason: "user_not_found" }});
  return res.status(400).json({ message: "Usuário não encontrado" });
}

if (!senhaValida) {
  await AuditLog.create({ type: "login_fail", userId: user._id, nome: user.nome, ip, userAgent, meta: { reason: "wrong_password" }});
  return res.status(400).json({ message: "Senha incorreta" });
}

// sucesso
await AuditLog.create({ type: "login_success", userId: user._id, nome: user.nome, ip, userAgent });
    const { nome, senha } = req.body;

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

    return res.json({ token, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
