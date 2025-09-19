// FIX: Changed express import from namespace to named imports (Request, Response, NextFunction) and updated type annotations to fix type errors.
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Estende a interface Request do Express para incluir a propriedade 'user'
declare global {
  namespace Express {
    interface Request {
      user?: string | jwt.JwtPayload;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "Nenhum token, autorização negada" });
  }

  const token = authHeader.split(" ")[1]; // Formato "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ msg: "Formato de token inválido, autorização negada" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("A chave secreta JWT não está definida.");
    }
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token não é válido" });
  }
};

export default authMiddleware;
