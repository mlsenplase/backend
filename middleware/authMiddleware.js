import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json("Não autorizado");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json("Token inválido");
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json("Acesso restrito ao admin");

  next();
};
