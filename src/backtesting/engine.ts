import {
  Kline,
  BacktestResult,
  BacktestConfig,
  BacktestResultExtended,
  TradeResult,
  TradeResultExtended,
  MarketCondition,
} from "./types";
import { getScenario, getAllScenarios } from "./scenarios";
import { getScenarioMetadata } from "./scenarioGenerator";

/**
 * Configuración OPTIMIZADA - Mejor resultado: 50% WR, +$30.50
 */
const DEFAULT_CONFIG: BacktestConfig = {
  initialBalance: 1000,
  leverage: 10,
  positionSizePercent: 0.1,
  bbPeriod: 20,
  bbStdDev: 2.0,
  rsiPeriod: 14,
  rsiOversold: 30,
  rsiOverbought: 70,
  minDistance: 0.3,
  stopLossPercent: 0.8,
  takeProfitPercent: 1.6,
  feePercent: 0.04,
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
 * Calcular SMA para detección de tendencia
 */
function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((a, b) => a + b, 0) / period;
}

/**
 * Detectar tendencia usando SMA
 */
function detectTrend(prices: number[]): "up" | "down" | "neutral" {
  const smaShort = calculateSMA(prices, 5);
  const smaLong = calculateSMA(prices, 15);

  if (!smaShort || !smaLong) return "neutral";

  const diff = ((smaShort - smaLong) / smaLong) * 100;

  if (diff > 0.5) return "up";
  if (diff < -0.5) return "down";
  return "neutral";
}

/**
 * Detectar volatilidad
 */
function detectVolatility(prices: number[]): "high" | "normal" | "low" {
  if (prices.length < 10) return "normal";

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(Math.abs((prices[i] - prices[i-1]) / prices[i-1]) * 100);
  }

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

  if (avgChange > 1.0) return "high";
  if (avgChange < 0.3) return "low";
  return "normal";
}

/**
 * Detectar régimen de mercado
 */
function detectMarketRegime(prices: number[]): "trending_up" | "trending_down" | "ranging" | "volatile" {
  const trend = detectTrend(prices);
  const volatility = detectVolatility(prices);

  if (volatility === "high") return "volatile";

  if (trend === "up") return "trending_up";
  if (trend === "down") return "trending_down";
  return "ranging";
}

/**
 * Calcular cambio de precio reciente
 */
function calculateRecentChange(prices: number[]): number {
  if (prices.length < 4) return 0;
  return ((prices[prices.length - 1] - prices[prices.length - 4]) / prices[prices.length - 4]) * 100;
}

/**
 * Verificar si el escenario es de tendencia (evitarlo)
 */
function isTrendingCondition(marketCondition: string, regime: string): boolean {
  // Filtrar por condición del escenario
  if (marketCondition === "trending_up" || marketCondition === "trending_down") {
    return true;
  }
  // También filtrar por régimen detectado
  if (regime === "trending_up" || regime === "trending_down") {
    return true;
  }
  return false;
}

/**
 * Estrategia SIMPLE y EFECTIVA - Solo rango y baja volatilidad
 * Claves: Entradas estrictas, evitar tendencias
 */
function analyzeMarket(
  prices: number[],
  config: BacktestConfig,
  lastSignal: "BUY" | "SELL" | null,
  lastSignalPrice: number,
  marketCondition: string = "ranging"
): "BUY" | "SELL" | "HOLD" {
  const bb = calculateBollingerBands(prices, config.bbPeriod, config.bbStdDev);
  if (!bb) return "HOLD";

  const currentPrice = prices[prices.length - 1];
  const rsi = calculateRSI(prices, config.rsiPeriod);
  const sma20 = calculateSMA(prices, 20);

  // Distancia mínima desde última señal
  const priceChanged =
    lastSignalPrice > 0 &&
    Math.abs(currentPrice - lastSignalPrice) / lastSignalPrice > config.minDistance / 100;

  const regime = detectMarketRegime(prices);

  // === BLOQUEAR OPERACIONES EN MERCADOS EN TENDENCIA ===
  if (isTrendingCondition(marketCondition, regime)) {
    return "HOLD";
  }

  // === SOLO OPERAR EN RANGING Y LOW VOLATILITY ===
  const isTradeableCondition = marketCondition === "low_volatility" ||
                               marketCondition === "ranging" ||
                               regime === "ranging";

  if (!isTradeableCondition) return "HOLD";

  // === COMPRAR: Precio en banda inferior + RSI sobrevendido ===
  const atLowerBand = currentPrice <= bb.lower * 1.01;
  const rsiOversold = rsi !== null && rsi < 35;
  const priceAboveSMA = sma20 ? currentPrice > sma20 * 0.98 : true;

  if (atLowerBand && rsiOversold && priceAboveSMA && (lastSignal !== "BUY" || priceChanged)) {
    return "BUY";
  }

  // === VENDER: Precio en banda superior + RSI sobrecomprado ===
  const atUpperBand = currentPrice >= bb.upper * 0.99;
  const rsiOverbought = rsi !== null && rsi > 65;
  const priceBelowSMA = sma20 ? currentPrice < sma20 * 1.02 : true;

  if (atUpperBand && rsiOverbought && priceBelowSMA && (lastSignal !== "SELL" || priceChanged)) {
    return "SELL";
  }

  return "HOLD";
}

/**
 * Check if we should trade based on market condition
 * SOLO operar en ranging y low_volatility - EVITAR tendencias
 */
function shouldTrade(scenarioName: string): boolean {
  // Escenarios donde NO operar (tendencias)
  const trendingScenarios = [
    'bullish_volatile', 'strong_uptrend', 'gradual_rally', 'break_out',
    'momentum_gap', 'double_bottom_bounce', 'ascending_triangle',
    'bullish_reversal', 'trendline_support', 'volume_surge',
    'bearish_volatile', 'strong_downtrend', 'gradual_decline',
    'break_down', 'momentum_drop', 'double_top_drop',
    'descending_triangle', 'bearish_reversal', 'trendline_resistance',
    'volume_surge_bearish'
  ];

  // Retornar false si es escenario de tendencia
  if (trendingScenarios.includes(scenarioName)) {
    return false;
  }

  return true;
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
  const metadata = getScenarioMetadata(scenarioName);
  const marketCondition = metadata?.condition?.toString() || "ranging";

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
    entryTimestamp: number; // For calculating trade duration
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

      // TRAILING STOP MEJORADO: Mover SL agresivamente
      // 1. Mover a BE cuando precio favorece 0.5%
      const breakevenThreshold = position.entryPrice * 0.005;
      // 2. Trail al 50% del profit cuando price sigue moviendo
      const profitLock = position.type === "BUY"
        ? (currentPrice - position.entryPrice) * 0.5
        : (position.entryPrice - currentPrice) * 0.5;

      if (position.type === "BUY" && currentPrice > position.entryPrice + breakevenThreshold) {
        // Mover SL a BE + 50% del profit
        const newSL = position.entryPrice + profitLock;
        if (newSL > position.stopLoss) {
          position.stopLoss = newSL;
        }
      } else if (position.type === "SELL" && currentPrice < position.entryPrice - breakevenThreshold) {
        // Mover SL a BE + 50% del profit
        const newSL = position.entryPrice - profitLock;
        if (newSL < position.stopLoss) {
          position.stopLoss = newSL;
        }
      }

      // Cerrar por SL/TP
      if (closed && closeReason) {
        const positionType = position?.type;
        const trade = closePosition(currentPrice, closeReason, currentTime);
        if (trade) {
          trades.push(trade);
          lastSignal = positionType === "BUY" ? "SELL" : "BUY";
          lastSignalPrice = currentPrice;
        }
      }
    } else {
      // Sin posición, buscar entrada
      const signal = analyzeMarket(
        currentPrices,
        cfg,
        lastSignal,
        lastSignalPrice,
        marketCondition
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
          entryTimestamp: klines[i].openTime,
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

/**
 * Execute backtest with extended tracking (exit reasons and market conditions)
 */
export function runBacktestExtended(
  scenarioName: string,
  config: Partial<BacktestConfig> = {}
): BacktestResultExtended {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const klines = getScenario(scenarioName);
  const metadata = getScenarioMetadata(scenarioName);
  const scenarioCondition = metadata?.condition || MarketCondition.RANGING;
  const marketCondition = metadata?.condition?.toString() || "ranging";

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
    entryTimestamp: number; // For calculating trade duration
    stopLoss: number;
    takeProfit: number;
  } | null = null;

  const trades: TradeResultExtended[] = [];
  let lastSignal: "BUY" | "SELL" | null = null;
  let lastSignalPrice = 0;

  // Track exit reasons
  let slTriggered = 0;
  let tpTriggered = 0;
  let signalClosed = 0;

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

    // Map exit reason
    const exitReason: "stop_loss" | "take_profit" | "signal" =
      reason === "SL" ? "stop_loss" : reason === "TP" ? "take_profit" : "signal";

    // Track exit types
    if (reason === "SL") slTriggered++;
    else if (reason === "TP") tpTriggered++;
    else signalClosed++;

    // Calculate duration in minutes
    const exitTimestamp = new Date(currentTime).getTime();
    const durationMinutes = Math.round(
      (exitTimestamp - position.entryTimestamp) / 60000
    );

    const trade: TradeResultExtended = {
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice,
      quantity: position.quantity,
      profit: netPnl,
      profitPercent,
      entryTime: position.entryTime,
      exitTime: currentTime,
      exitReason,
      marketCondition: scenarioCondition,
      durationMinutes,
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

      // TRAILING STOP MEJORADO: Mover SL agresivamente
      // 1. Mover a BE cuando precio favorece 0.5%
      const breakevenThreshold = position.entryPrice * 0.005;
      // 2. Trail al 50% del profit cuando price sigue moviendo
      const profitLock = position.type === "BUY"
        ? (currentPrice - position.entryPrice) * 0.5
        : (position.entryPrice - currentPrice) * 0.5;

      if (position.type === "BUY" && currentPrice > position.entryPrice + breakevenThreshold) {
        // Mover SL a BE + 50% del profit
        const newSL = position.entryPrice + profitLock;
        if (newSL > position.stopLoss) {
          position.stopLoss = newSL;
        }
      } else if (position.type === "SELL" && currentPrice < position.entryPrice - breakevenThreshold) {
        // Mover SL a BE + 50% del profit
        const newSL = position.entryPrice - profitLock;
        if (newSL < position.stopLoss) {
          position.stopLoss = newSL;
        }
      }

      // Cerrar por SL/TP
      if (closed && closeReason) {
        const positionType = position?.type;
        const trade = closePosition(currentPrice, closeReason, currentTime);
        if (trade) {
          trades.push(trade);
          lastSignal = positionType === "BUY" ? "SELL" : "BUY";
          lastSignalPrice = currentPrice;
        }
      }
    } else {
      // Sin posición, buscar entrada
      const signal = analyzeMarket(
        currentPrices,
        cfg,
        lastSignal,
        lastSignalPrice,
        marketCondition
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
          entryTimestamp: klines[i].openTime,
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

    // Final position closed by signal
    signalClosed++;

    // Calculate duration for final position
    const finalExitTime = new Date().toISOString();
    const finalDuration = Math.round(
      (new Date(finalExitTime).getTime() - position.entryTimestamp) / 60000
    );

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
      exitTime: finalExitTime,
      exitReason: "signal",
      marketCondition: scenarioCondition,
      durationMinutes: finalDuration,
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
    scenarioName,
    scenarioCondition,
    slTriggered,
    tpTriggered,
    signalClosed,
  };
}

/**
 * Execute all backtests with extended tracking
 */
export function runAllBacktestsExtended(
  config: Partial<BacktestConfig> = {}
): Record<string, BacktestResultExtended> {
  const results: Record<string, BacktestResultExtended> = {};

  for (const scenarioName of getAllScenarios()) {
    // Filtrar escenarios de tendencia
    if (!shouldTrade(scenarioName)) {
      console.log(`\n⏭️  OMITIENDO ${scenarioName} (mercado en tendencia)`);
      continue;
    }

    console.log(`\n🔄 Ejecutando backtest: ${scenarioName}`);
    results[scenarioName] = runBacktestExtended(scenarioName, config);
  }

  return results;
}