import "dotenv/config";
import express from "express";
import { startBot } from "./bot";

const PORT = 3002;

// === Start Server + Bot ===
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bot running");
});

// Iniciar el bot automaticamente al levantar el servidor
const start = async () => {
  try {
    console.log(`Iniciando servidor en puerto ${PORT}...`);
    await startBot();
    console.log("Bot iniciado correctamente");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el bot:", error);
    process.exit(1);
  }
};

start();
