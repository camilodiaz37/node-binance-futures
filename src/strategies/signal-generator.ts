import { getStrategy } from "./base-strategy";
import { getBinanceFuturesClient } from "../services/binance-futures";
import { getConfig } from "../config";
import { TradingSignal } from "../types/strategy";

export interface SignalResult {
  signal: TradingSignal;
  currentPrice: number;
  timestamp: Date;
}

/**
 * Generate trading signal based on current market data
 */
export async function generateSignal(symbol?: string): Promise<SignalResult> {
  const config = getConfig();
  const client = getBinanceFuturesClient();
  const strategy = getStrategy();

  const tradeSymbol = symbol || config.symbol;

  // Get klines for analysis
  const klines = await client.getKlines(
    tradeSymbol,
    config.executionInterval === 15 ? "15m" : "1h",
    undefined,
    undefined,
    100
  );

  const currentPrice = await client.getCurrentPrice(tradeSymbol);
  const signal = strategy.analyze(klines);

  return {
    signal,
    currentPrice,
    timestamp: new Date(),
  };
}

/**
 * Check if we should open a new position
 */
export async function shouldOpenPosition(symbol?: string): Promise<{
  shouldTrade: boolean;
  side: "BUY" | "SELL" | null;
  reason: string;
}> {
  const result = await generateSignal(symbol);

  if (result.signal.type === "HOLD") {
    return {
      shouldTrade: false,
      side: null,
      reason: result.signal.reason,
    };
  }

  return {
    shouldTrade: true,
    side: result.signal.type === "BUY" ? "BUY" : "SELL",
    reason: result.signal.reason,
  };
}

/**
 * Get detailed signal analysis
 */
export async function analyzeMarket(symbol?: string): Promise<{
  signal: TradingSignal;
  currentPrice: number;
  indicators: {
    rsi: number;
    macd: number;
    signal: number;
    sma: number;
  };
  trend: string;
  timestamp: Date;
}> {
  const result = await generateSignal(symbol);

  return {
    signal: result.signal,
    currentPrice: result.currentPrice,
    indicators: result.signal.indicators,
    trend: result.signal.type === "BUY" ? "BULLISH" : result.signal.type === "SELL" ? "BEARISH" : "NEUTRAL",
    timestamp: result.timestamp,
  };
}