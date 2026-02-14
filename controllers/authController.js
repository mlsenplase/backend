import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { nome, senha } = req.body;

    const userExists = await User.findOne({ nome });
    if (userExists)
      return res.status(400).json("Usuário já existe");

    const senhaHash = await bcrypt.hash(senha, 12);

    const user = await User.create({
      nome,
      senha: senhaHash
    });

    res.status(201).json("Usuário criado com sucesso");

  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { nome, senha } = req.body;

    const user = await User.findOne({ nome });
    if (!user)
      return res.status(400).json("Usuário não encontrado");

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida)
      return res.status(400).json("Senha incorreta");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json(err.message);
  }
};
