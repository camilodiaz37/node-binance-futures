import { Kline } from "../types";
import { StrategyConfig, IndicatorValues } from "../types/strategy";

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  // First average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smoothed averages
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number; histogram: number } {
  if (prices.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macdLine = fastEMA - slowEMA;

  // Calculate signal line (EMA of MACD)
  const macdValues: number[] = [];
  for (let i = slowPeriod; i < prices.length; i++) {
    const f = calculateEMA(prices.slice(0, i + 1), fastPeriod);
    const s = calculateEMA(prices.slice(0, i + 1), slowPeriod);
    macdValues.push(f - s);
  }

  const signal = calculateEMA(macdValues, signalPeriod);

  return {
    macd: macdLine,
    signal,
    histogram: macdLine - signal,
  };
}

/**
 * Calculate EMA (Exponential Moving Average)
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate SMA (Simple Moving Average)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calculate all indicators for a given set of klines
 */
export function calculateIndicators(klines: Kline[], config: StrategyConfig): IndicatorValues {
  const closes = klines.map((k) => parseFloat(k.close));

  const rsi = calculateRSI(closes, config.rsiPeriod);
  const { macd, signal } = calculateMACD(
    closes,
    config.macdFast,
    config.macdSlow,
    config.macdSignal
  );
  const sma = calculateSMA(closes, config.smaPeriod);

  return {
    rsi,
    macd,
    signal,
    sma,
  };
}

/**
 * Get close prices from klines
 */
export function getClosePrices(klines: Kline[]): number[] {
  return klines.map((k) => parseFloat(k.close));
}

/**
 * Calculate price change percentage
 */
export function calculatePriceChange(klines: Kline[], periods: number = 1): number {
  if (klines.length < 2) return 0;

  const currentPrice = parseFloat(klines[klines.length - 1].close);
  const pastPrice = parseFloat(klines[Math.max(0, klines.length - 1 - periods)].close);

  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

/**
 * Detect price trend
 */
export function detectTrend(klines: Kline[], smaPeriod: number = 50): "UP" | "DOWN" | "SIDEWAYS" {
  if (klines.length < smaPeriod) return "SIDEWAYS";

  const closes = getClosePrices(klines);
  const sma = calculateSMA(closes, smaPeriod);
  const currentPrice = closes[closes.length - 1];

  const threshold = currentPrice * 0.005; // 0.5% threshold

  if (currentPrice > sma + threshold) return "UP";
  if (currentPrice < sma - threshold) return "DOWN";
  return "SIDEWAYS";
}