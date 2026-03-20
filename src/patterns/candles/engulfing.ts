/**
 * Engulfing Pattern Detector
 *
 * Bullish Engulfing: Bearish candle followed by larger bullish candle that completely covers the first
 * Bearish Engulfing: Bullish candle followed by larger bearish candle that completely covers the first
 * Direction: Opposite of the first candle (reversal signal)
 */
import { Candle, Pattern } from '../types';
import { isEngulfing, isLongBody, toCandle } from '../utils/validation';

export interface EngulfingConfig {
  minBodyRatio?: number;  // Minimum ratio of engulfing body to engulfed body
}

/**
 * Detects Bullish Engulfing pattern
 */
function detectBullishEngulfing(candles: Candle[], index: number): Pattern | null {
  if (index < 1 || index >= candles.length) {
    return null;
  }

  const first = candles[index - 1];
  const second = candles[index];

  // First candle must be bearish
  if (first.isBullish) {
    return null;
  }

  // Second candle must be bullish
  if (!second.isBullish) {
    return null;
  }

  // Second candle must engulf the first
  if (!isEngulfing(first, second)) {
    return null;
  }

  // Second candle should have a reasonable body size
  if (!isLongBody(second, 0.5)) {
    return null;
  }

  const confidence = second.body / first.body;

  return {
    type: 'BULLISH_ENGULFING',
    direction: 'BULLISH',
    timestamp: 0,
    price: second.close,
    confidence: Math.min(1, confidence),
  };
}

/**
 * Detects Bearish Engulfing pattern
 */
function detectBearishEngulfing(candles: Candle[], index: number): Pattern | null {
  if (index < 1 || index >= candles.length) {
    return null;
  }

  const first = candles[index - 1];
  const second = candles[index];

  // First candle must be bullish
  if (!first.isBullish) {
    return null;
  }

  // Second candle must be bearish
  if (second.isBullish) {
    return null;
  }

  // Second candle must engulf the first
  if (!isEngulfing(first, second)) {
    return null;
  }

  // Second candle should have a reasonable body size
  if (!isLongBody(second, 0.5)) {
    return null;
  }

  const confidence = second.body / first.body;

  return {
    type: 'BEARISH_ENGULFING',
    direction: 'BEARISH',
    timestamp: 0,
    price: second.close,
    confidence: Math.min(1, confidence),
  };
}

/**
 * Detects Engulfing pattern (both bullish and bearish)
 * Returns the pattern if found, null otherwise
 */
export function detectEngulfing(
  candles: Candle[],
  index: number,
  config: EngulfingConfig = {}
): Pattern | null {
  // Try bullish first
  const bullish = detectBullishEngulfing(candles, index);
  if (bullish) {
    return bullish;
  }

  // Then try bearish
  return detectBearishEngulfing(candles, index);
}

/**
 * Detects all Engulfing patterns in a candle array
 */
export function detectAllEngulfings(
  ohlcvData: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[],
  config: EngulfingConfig = {}
): Pattern[] {
  const candles = ohlcvData.map(toCandle);
  const patterns: Pattern[] = [];

  for (let i = 1; i < candles.length; i++) {
    const pattern = detectEngulfing(candles, i, config);
    if (pattern) {
      pattern.timestamp = ohlcvData[i].timestamp;
      pattern.price = ohlcvData[i].close;
      patterns.push(pattern);
    }
  }

  return patterns;
}

export default detectEngulfing;