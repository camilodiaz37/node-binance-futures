/**
 * Evening Star Pattern Detector
 *
 * Pattern: Bullish candle + small body candle (doji/star) + bearish candle that closes below the midpoint of the first candle
 * Direction: BEARISH (reversal from uptrend)
 */
import { Candle, Pattern } from '../types';
import { isSmallBody, isLongBody, toCandle } from '../utils/validation';

export interface EveningStarConfig {
  smallBodyThreshold?: number;  // Default 0.3 (30% of range)
}

/**
 * Detects Evening Star pattern
 * Returns the pattern if found, null otherwise
 */
export function detectEveningStar(
  candles: Candle[],
  index: number,
  config: EveningStarConfig = {}
): Pattern | null {
  const { smallBodyThreshold = 0.3 } = config;

  // Need at least 3 candles
  if (index < 2 || index >= candles.length) {
    return null;
  }

  const first = candles[index - 2];
  const second = candles[index - 1];
  const third = candles[index];

  // First candle: long bullish (green)
  if (!first.isBullish) {
    return null;
  }

  if (!isLongBody(first, 0.5)) {
    return null;
  }

  // Second candle: small body (doji or star) - can be bullish or bearish
  if (!isSmallBody(second, smallBodyThreshold)) {
    return null;
  }

  // Third candle: long bearish that closes below the midpoint of first candle
  if (third.isBullish) {
    return null;
  }

  if (!isLongBody(third, 0.5)) {
    return null;
  }

  const firstMidpoint = (first.open + first.close) / 2;
  if (third.close >= firstMidpoint) {
    return null;
  }

  // Pattern found - calculate confidence
  const bodyRatio = third.body / first.body;
  const confidence = Math.min(1, bodyRatio * 0.5 + 0.5);

  return {
    type: 'EVENING_STAR',
    direction: 'BEARISH',
    timestamp: 0,  // Will be set by caller
    price: third.close,
    confidence,
  };
}

/**
 * Detects all Evening Star patterns in a candle array
 */
export function detectAllEveningStars(
  ohlcvData: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[],
  config: EveningStarConfig = {}
): Pattern[] {
  const candles = ohlcvData.map(toCandle);
  const patterns: Pattern[] = [];

  for (let i = 2; i < candles.length; i++) {
    const pattern = detectEveningStar(candles, i, config);
    if (pattern) {
      pattern.timestamp = ohlcvData[i].timestamp;
      pattern.price = ohlcvData[i].close;
      patterns.push(pattern);
    }
  }

  return patterns;
}

export default detectEveningStar;