import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  // 1) tenta cookie
  const cookieToken = req.cookies?.token;

  // 2) tenta header Authorization
  const auth = req.headers.authorization;
  const headerToken = auth && auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ message: "Sem token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Somente admin" });
  }
  next();
}
