import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB, { seedAdminUser, seedInitialSettings } from "./config/db";
import apiRoutes from "./routes/api";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Let type inference handle the app type to avoid overload resolution issues.
const app = express();

// Configuração do CORS para produção
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Fallback para desenvolvimento local
  optionsSuccessStatus: 200,
};

// Middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Rotas da API
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdminUser();
    await seedInitialSettings();
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (error) {
    console.error(
      "Falha ao conectar ao banco de dados e iniciar o servidor:",
      error
    );
    process.exit(1);
  }
};

startServer();
