import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const auth = req.headers.authorization; // "Bearer TOKEN"

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Sem token" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Somente admin" });
  }
  next();
}
