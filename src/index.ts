import "dotenv/config";
import express from "express";
import { startBot, stopBot, getBotStatus, runOnce } from "./bot";
import { getConfig, getStrategyConfig } from "./config";
import { getOrderService } from "./services/order-service";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;

// === Express App ===
const app = express();

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Bot status endpoint
app.get("/status", (req, res) => {
  const status = getBotStatus();
  const config = getConfig();
  const strategyConfig = getStrategyConfig();
  const orderService = getOrderService();

  res.json({
    bot: status,
    config: {
      symbol: config.symbol,
      leverage: config.leverage,
      riskPercent: config.riskPercent,
      stopLossPercent: config.stopLossPercent,
      takeProfitPercent: config.takeProfitPercent,
      executionInterval: config.executionInterval,
    },
    strategy: strategyConfig,
    positions: {
      open: orderService.getOpenOrders(),
      closed: orderService.getClosedOrders().slice(-10),
    },
  });
});

// Manual trade trigger
app.post("/trade", async (req, res) => {
  try {
    await runOnce();
    res.json({ status: "trade_cycle_completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stop bot
app.post("/stop", (req, res) => {
  stopBot();
  res.json({ status: "bot_stopped" });
});

// Start bot
app.post("/start", async (req, res) => {
  try {
    await startBot();
    res.json({ status: "bot_started" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === Start Server + Bot ===
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
