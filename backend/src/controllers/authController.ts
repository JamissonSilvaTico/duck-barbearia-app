// FIX: Changed express import to use named imports for Request and Response to resolve type errors.
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const login = async (req: Request, res: Response) => {
  const { password } = req.body;

  try {
    // Como só há um administrador, podemos buscar o primeiro usuário que encontrarmos.
    const user = await User.findOne();
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Usuário administrador não encontrado." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Senha incorreta." });
    }

    const payload = { user: { id: user.id } };
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("A chave secreta JWT não está definida.");
    }

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "8h" }, // Token expira em 8 horas
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ msg: "A nova senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const user = await User.findOne();
    if (!user) {
      return res
        .status(404)
        .json({ msg: "Usuário administrador não encontrado." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: "Senha alterada com sucesso." });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};
