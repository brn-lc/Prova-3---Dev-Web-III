import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./database";
import reservaRoutes from "./routes/reservaRoutes";

// Conectar ao MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens
app.use(express.json()); // Permite que o Express entenda JSON

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, "..", "public")));

// Rotas da API
app.use("/api/reservas", reservaRoutes);

// Rota principal para servir o frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
