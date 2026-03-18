import "dotenv/config";
import express from "express";
import { getAccountBalance } from "./binance";
import {
  // Market Data
  getTickerPrice,
  get24hrTicker,
  getKlines,
  getOrderBook,
  // Leverage
  setLeverage,
  setMarginType,
  // Orders
  placeOrder,
  cancelOrder,
  cancelAllOrders,
  getOrder,
  getOpenOrders,
  // Positions
  getPositions,
  getAccountInfo,
  // Types
  type PlaceOrderParams,
  type MarginType,
} from "./trading";

const app = express();
const PORT = 3002;

app.use(express.json());

// === Root ===
app.get("/", (req, res) => {
  res.json({
    message: "Servidor Express con TypeScript funcionando en puerto 3002",
  });
});

// === Original Balance Endpoint ===
app.get("/balance", async (req, res) => {
  try {
    const balance = await getAccountBalance();
    res.json(balance);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

// ============================================
// MARKET DATA ENDPOINTS
// ============================================

/**
 * GET /price?symbol=BTCUSDT
 * Get current price for a symbol
 */
app.get("/price", async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol || typeof symbol !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro symbol" });
      return;
    }
    const price = await getTickerPrice(symbol);
    res.json(price);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /ticker24hr?symbol=BTCUSDT
 * Get 24hr statistics
 */
app.get("/ticker24hr", async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol || typeof symbol !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro symbol" });
      return;
    }
    const ticker = await get24hrTicker(symbol);
    res.json(ticker);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /klines?symbol=BTCUSDT&interval=1m&limit=500
 * Get candlestick data
 */
app.get("/klines", async (req, res) => {
  try {
    const { symbol, interval, limit } = req.query;
    if (!symbol || typeof symbol !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro symbol" });
      return;
    }
    const klines = await getKlines(
      symbol,
      typeof interval === "string" ? interval : "1m",
      typeof limit === "string" ? parseInt(limit) : 500,
    );
    res.json(klines);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /orderbook?symbol=BTCUSDT&limit=100
 * Get order book depth
 */
app.get("/orderbook", async (req, res) => {
  try {
    const { symbol, limit } = req.query;
    if (!symbol || typeof symbol !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro symbol" });
      return;
    }
    const orderBook = await getOrderBook(
      symbol,
      typeof limit === "string" ? parseInt(limit) : 100,
    );
    res.json(orderBook);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

// ============================================
// LEVERAGE ENDPOINTS
// ============================================

/**
 * POST /leverage
 * Body: { "symbol": "BTCUSDT", "leverage": 10 }
 */
app.post("/leverage", async (req, res) => {
  try {
    const { symbol, leverage } = req.body;
    if (!symbol || !leverage) {
      res.status(400).json({ error: "Se requieren symbol y leverage" });
      return;
    }
    const result = await setLeverage(symbol, leverage);
    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * POST /margin-type
 * Body: { "symbol": "BTCUSDT", "marginType": "CROSSED" }
 */
app.post("/margin-type", async (req, res) => {
  try {
    const { symbol, marginType } = req.body;
    if (!symbol || !marginType) {
      res.status(400).json({ error: "Se requieren symbol y marginType" });
      return;
    }
    const result = await setMarginType(symbol, marginType as MarginType);
    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

// ============================================
// ORDER ENDPOINTS
// ============================================

/**
 * POST /order
 * Body: {
 *   "symbol": "BTCUSDT",
 *   "side": "BUY",
 *   "type": "MARKET",
 *   "quantity": 0.001,
 *   "price": 50000,          // Optional for MARKET orders
 *   "stopPrice": 49000,      // Optional for STOP orders
 *   "timeInForce": "GTC",    // Optional for LIMIT orders
 *   "positionSide": "LONG"  // Optional
 * }
 */
app.post("/order", async (req, res) => {
  try {
    const orderParams: PlaceOrderParams = req.body;

    if (
      !orderParams.symbol ||
      !orderParams.side ||
      !orderParams.type ||
      !orderParams.quantity
    ) {
      res.status(400).json({
        error: "Faltan parámetros requeridos: symbol, side, type, quantity",
      });
      return;
    }

    const order = await placeOrder(orderParams);
    res.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /order?symbol=BTCUSDT&orderId=123456
 * Cancel a specific order
 */
app.delete("/order", async (req, res) => {
  try {
    const { symbol, orderId } = req.query;
    if (!symbol || typeof symbol !== "string" || !orderId) {
      res.status(400).json({ error: "Se requieren symbol y orderId" });
      return;
    }
    const result = await cancelOrder(symbol, parseInt(orderId as string));
    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /all-orders?symbol=BTCUSDT
 * Cancel all open orders for a symbol
 */
app.delete("/all-orders", async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol || typeof symbol !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro symbol" });
      return;
    }
    const result = await cancelAllOrders(symbol);
    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /order?symbol=BTCUSDT&orderId=123456
 * Get order status
 */
app.get("/order", async (req, res) => {
  try {
    const { symbol, orderId } = req.query;
    if (!symbol || typeof symbol !== "string" || !orderId) {
      res.status(400).json({ error: "Se requieren symbol y orderId" });
      return;
    }
    const order = await getOrder(symbol, parseInt(orderId as string));
    res.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /open-orders?symbol=BTCUSDT
 * Get all open orders (optional symbol filter)
 */
app.get("/open-orders", async (req, res) => {
  try {
    const { symbol } = req.query;
    const orders = await getOpenOrders(symbol as string | undefined);
    res.json(orders);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

// ============================================
// POSITION ENDPOINTS
// ============================================

/**
 * GET /positions?symbol=BTCUSDT
 * Get current positions (optional symbol filter)
 */
app.get("/positions", async (req, res) => {
  try {
    const { symbol } = req.query;
    const positions = await getPositions(symbol as string | undefined);
    res.json(positions);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /account-info
 * Get full account information
 */
app.get("/account-info", async (req, res) => {
  try {
    const accountInfo = await getAccountInfo();
    res.json(accountInfo);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

// ============================================
// BOT ENDPOINTS
// ============================================

import { startBot, stopBot, getBotStatus } from "./bot";

/**
 * POST /bot/start
 * Iniciar el bot de trading
 */
app.post("/bot/start", async (req, res) => {
  try {
    await startBot();
    res.json({ message: "Bot iniciado", status: getBotStatus() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * POST /bot/stop
 * Detener el bot de trading
 */
app.post("/bot/stop", async (req, res) => {
  try {
    stopBot();
    res.json({ message: "Bot detenido", status: getBotStatus() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /bot/status
 * Ver estado del bot
 */
app.get("/bot/status", (req, res) => {
  res.json(getBotStatus());
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
