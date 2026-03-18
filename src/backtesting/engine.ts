import { Kline, BacktestResult, TradeResult, BacktestConfig } from "./types";
import { getScenario, getAllScenarios } from "./scenarios";

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: BacktestConfig = {
  initialBalance: 1000,
  leverage: 10,
  positionSizePercent: 0.1, // 10% del balance
  bbPeriod: 20,
  bbStdDev: 2,
  rsiPeriod: 14,
  rsiOversold: 35,
  rsiOverbought: 65,
  minDistance: 0.5, // 0.5% mínimo entre señales
  stopLossPercent: 0.5, // 0.5% = 5% con 10x
  takeProfitPercent: 1.0, // 1.0% = 10% con 10x
  feePercent: 0.04, // 0.04% por trade
};

/**
 * Calcular Bollinger Bands
 */
function calculateBollingerBands(
  prices: number[],
  period: number,
  stdDev: number
): { upper: number; middle: number; lower: number } | null {
  if (prices.length < period) return null;

  const recentPrices = prices.slice(-period);
  const sum = recentPrices.reduce((a, b) => a + b, 0);
  const middle = sum / period;

  const variance =
    recentPrices.reduce((acc, price) => acc + Math.pow(price - middle, 2), 0) /
    period;
  const std = Math.sqrt(variance);

  return {
    upper: middle + stdDev * std,
    middle,
    lower: middle - stdDev * std,
  };
}

/**
 * Calcular RSI
 */
function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Analizar mercado y generar señal
 */
function analyzeMarket(
  prices: number[],
  config: BacktestConfig,
  lastSignal: "BUY" | "SELL" | null,
  lastSignalPrice: number
): "BUY" | "SELL" | "HOLD" {
  const bb = calculateBollingerBands(prices, config.bbPeriod, config.bbStdDev);
  if (!bb) return "HOLD";

  const currentPrice = prices[prices.length - 1];
  const rsi = calculateRSI(prices, config.rsiPeriod);

  // Señal de compra
  const priceNearLower = currentPrice <= bb.lower * 1.01;
  const priceBelowLower = currentPrice < bb.lower;

  const priceChanged =
    lastSignalPrice > 0 &&
    Math.abs(currentPrice - lastSignalPrice) / lastSignalPrice >
      config.minDistance / 100;

  if (
    (priceNearLower || priceBelowLower) &&
    (!rsi || rsi < config.rsiOversold) &&
    (lastSignal !== "BUY" || priceChanged)
  ) {
    return "BUY";
  }

  // Señal de venta
  const priceNearUpper = currentPrice >= bb.upper * 0.99;
  const priceAboveUpper = currentPrice > bb.upper;

  if (
    (priceNearUpper || priceAboveUpper) &&
    (!rsi || rsi > config.rsiOverbought) &&
    (lastSignal !== "SELL" || priceChanged)
  ) {
    return "SELL";
  }

  return "HOLD";
}

/**
 * Ejecutar backtest para un escenario
 */
export function runBacktest(
  scenarioName: string,
  config: Partial<BacktestConfig> = {}
): BacktestResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const klines = getScenario(scenarioName);

  if (!klines) {
    throw new Error(`Escenario "${scenarioName}" no encontrado`);
  }

  const closes = klines.map((k) => parseFloat(k.close));

  let balance = cfg.initialBalance;
  let position: {
    type: "BUY" | "SELL";
    entryPrice: number;
    quantity: number;
    entryTime: string;
    stopLoss: number;
    takeProfit: number;
  } | null = null;

  const trades: TradeResult[] = [];
  let lastSignal: "BUY" | "SELL" | null = null;
  let lastSignalPrice = 0;

  // Calcular SL/TP
  const calculateSLTP = (entryPrice: number, side: "BUY" | "SELL") => {
    if (side === "BUY") {
      return {
        stopLoss: entryPrice * (1 - cfg.stopLossPercent / 100),
        takeProfit: entryPrice * (1 + cfg.takeProfitPercent / 100),
      };
    } else {
      return {
        stopLoss: entryPrice * (1 + cfg.stopLossPercent / 100),
        takeProfit: entryPrice * (1 - cfg.takeProfitPercent / 100),
      };
    }
  };

  // Función para cerrar posición con fee
  const closePosition = (
    exitPrice: number,
    reason: "SL" | "TP" | "SIGNAL",
    currentTime: string
  ) => {
    if (!position) return null;

    const pnl =
      position.type === "BUY"
        ? (exitPrice - position.entryPrice) * position.quantity * cfg.leverage
        : (position.entryPrice - exitPrice) * position.quantity * cfg.leverage;

    // Aplicar fees (entrada + salida)
    const fee = position.entryPrice * position.quantity * cfg.feePercent * 2;
    const netPnl = pnl - fee;

    balance += netPnl;

    const profitPercent =
      position.type === "BUY"
        ? ((exitPrice - position.entryPrice) / position.entryPrice) * 100 * cfg.leverage
        : ((position.entryPrice - exitPrice) / position.entryPrice) * 100 * cfg.leverage;

    const trade: TradeResult = {
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice,
      quantity: position.quantity,
      profit: netPnl,
      profitPercent,
      entryTime: position.entryTime,
      exitTime: currentTime,
    };

    console.log(
      `   ${reason === "SL" ? "🛑 SL" : reason === "TP" ? "🎯 TP" : "🔄"} ` +
        `${position.type} | Entry: $${position.entryPrice.toFixed(2)} | ` +
        `Exit: $${exitPrice.toFixed(2)} | P/L: $${netPnl.toFixed(2)}`
    );

    position = null;
    return trade;
  };

  // Simular cada vela
  for (let i = cfg.bbPeriod; i < closes.length; i++) {
    const currentPrices = closes.slice(0, i + 1);
    const currentPrice = currentPrices[currentPrices.length - 1];
    const currentTime = new Date(klines[i].openTime).toISOString();

    // Si hay posición abierta, verificar SL/TP primero
    if (position) {
      let closed = false;
      let closeReason: "SL" | "TP" | null = null;

      // Verificar Stop Loss
      if (
        (position.type === "BUY" && currentPrice <= position.stopLoss) ||
        (position.type === "SELL" && currentPrice >= position.stopLoss)
      ) {
        closed = true;
        closeReason = "SL";
      }
      // Verificar Take Profit
      else if (
        (position.type === "BUY" && currentPrice >= position.takeProfit) ||
        (position.type === "SELL" && currentPrice <= position.takeProfit)
      ) {
        closed = true;
        closeReason = "TP";
      }

      // Cerrar por SL/TP
      if (closed && closeReason) {
        const trade = closePosition(currentPrice, closeReason, currentTime);
        if (trade) {
          trades.push(trade);
          lastSignal = position!.type === "BUY" ? "SELL" : "BUY";
          lastSignalPrice = currentPrice;
        }
      } else {
        // Cerrar posición si hay señal opuesta
        const signal = analyzeMarket(
          currentPrices,
          cfg,
          lastSignal,
          lastSignalPrice
        );

        if (
          (signal === "SELL" && position.type === "BUY") ||
          (signal === "BUY" && position.type === "SELL")
        ) {
          const trade = closePosition(currentPrice, "SIGNAL", currentTime);
          if (trade) {
            trades.push(trade);
            lastSignal = signal;
            lastSignalPrice = currentPrice;
          }
        }
      }
    } else {
      // Sin posición, buscar entrada
      const signal = analyzeMarket(
        currentPrices,
        cfg,
        lastSignal,
        lastSignalPrice
      );

      if (signal === "BUY" || signal === "SELL") {
        const positionValue = balance * cfg.positionSizePercent;
        const quantity = positionValue / currentPrice;

        const { stopLoss, takeProfit } = calculateSLTP(currentPrice, signal);

        position = {
          type: signal,
          entryPrice: currentPrice,
          quantity,
          entryTime: currentTime,
          stopLoss,
          takeProfit,
        };

        lastSignal = signal;
        lastSignalPrice = currentPrice;
      }
    }
  }

  // Cerrar posición final si existe
  if (position) {
    const finalPrice = closes[closes.length - 1];
    const profit =
      position.type === "BUY"
        ? (finalPrice - position.entryPrice) * position.quantity * cfg.leverage
        : (position.entryPrice - finalPrice) * position.quantity * cfg.leverage;

    balance += profit;
    trades.push({
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: finalPrice,
      quantity: position.quantity,
      profit,
      profitPercent:
        position.type === "BUY"
          ? ((finalPrice - position.entryPrice) / position.entryPrice) *
            100 *
            cfg.leverage
          : ((position.entryPrice - finalPrice) / position.entryPrice) *
            100 *
            cfg.leverage,
      entryTime: position.entryTime,
      exitTime: new Date().toISOString(),
    });
  }

  // Calcular estadísticas
  const winningTrades = trades.filter((t) => t.profit > 0);
  const losingTrades = trades.filter((t) => t.profit <= 0);
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLoss = Math.abs(
    losingTrades.reduce((sum, t) => sum + t.profit, 0)
  );

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate:
      trades.length > 0
        ? (winningTrades.length / trades.length) * 100
        : 0,
    totalProfit,
    totalLoss,
    netProfit: balance - cfg.initialBalance,
    roi: ((balance - cfg.initialBalance) / cfg.initialBalance) * 100,
    trades,
  };
}

/**
 * Ejecutar todos los escenarios
 */
export function runAllBacktests(
  config: Partial<BacktestConfig> = {}
): Record<string, BacktestResult> {
  const results: Record<string, BacktestResult> = {};

  for (const scenarioName of getAllScenarios()) {
    console.log(`\n🔄 Ejecutando backtest: ${scenarioName}`);
    results[scenarioName] = runBacktest(scenarioName, config);
  }

  return results;
}

/**
 * Imprimir resultados de backtest
 */
export function printResults(
  scenarioName: string,
  result: BacktestResult
): void {
  console.log(`\n📊 RESULTADOS: ${scenarioName}`);
  console.log("=".repeat(50));
  console.log(`Total trades: ${result.totalTrades}`);
  console.log(`Ganados: ${result.winningTrades}`);
  console.log(`Perdidos: ${result.losingTrades}`);
  console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
  console.log(`Ganancia total: $${result.totalProfit.toFixed(2)}`);
  console.log(`Pérdida total: $${result.totalLoss.toFixed(2)}`);
  console.log(`Profit neto: $${result.netProfit.toFixed(2)}`);
  console.log(`ROI: ${result.roi.toFixed(2)}%`);

  if (result.trades.length > 0) {
    console.log("\n📋 Detalle de trades:");
    result.trades.forEach((trade, i) => {
      const emoji = trade.profit >= 0 ? "✅" : "❌";
      console.log(
        `  ${i + 1}. ${trade.type} | Entry: $${trade.entryPrice.toFixed(2)} | Exit: $${trade.exitPrice.toFixed(2)} | P/L: $${trade.profit.toFixed(2)} (${trade.profitPercent.toFixed(2)}%) ${emoji}`
      );
    });
  }
}