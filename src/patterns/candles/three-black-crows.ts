/**
 * Three Black Crows Pattern Detector
 *
 * Pattern: Three consecutive bearish candles where each opens within the previous candle's body
 * and closes lower than the previous close
 * Direction: BEARISH (continuation or reversal)
 */
import { Candle, Pattern } from '../types';
import { isLongBody, opensWithin, toCandle } from '../utils/validation';

export interface ThreeBlackCrowsConfig {
  minBodySize?: number;  // Minimum body size relative to range
}

/**
 * Detects Three Black Crows pattern
 * Returns the pattern if found, null otherwise
 */
export function detectThreeBlackCrows(
  candles: Candle[],
  index: number,
  config: ThreeBlackCrowsConfig = {}
): Pattern | null {
  const { minBodySize = 0.5 } = config;

  // Need at least 3 candles
  if (index < 2 || index >= candles.length) {
    return null;
  }

  const first = candles[index - 2];
  const second = candles[index - 1];
  const third = candles[index];

  // All three must be bearish
  if (first.isBullish || second.isBullish || third.isBullish) {
    return null;
  }

  // All should have significant body size
  if (!isLongBody(first, minBodySize) ||
      !isLongBody(second, minBodySize) ||
      !isLongBody(third, minBodySize)) {
    return null;
  }

  // Second opens within first's body
  if (!opensWithin(second, first)) {
    return null;
  }

  // Third opens within second's body
  if (!opensWithin(third, second)) {
    return null;
  }

  // Each closes lower than the previous
  if (!(second.close < first.close && third.close < second.close)) {
    return null;
  }

  // Calculate confidence based on consistency
  const avgLoss = ((first.open - first.close) + (second.open - second.close)) / 2;
  const confidence = Math.min(1, avgLoss / 100);

  return {
    type: 'THREE_BLACK_CROWS',
    direction: 'BEARISH',
    timestamp: 0,
    price: third.close,
    confidence: Math.max(0.7, confidence),
    metadata: {
      firstClose: first.close,
      secondClose: second.close,
      thirdClose: third.close,
    },
  };
}

/**
 * Detects all Three Black Crows patterns in a candle array
 */
export function detectAllThreeBlackCrows(
  ohlcvData: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[],
  config: ThreeBlackCrowsConfig = {}
): Pattern[] {
  const candles = ohlcvData.map(toCandle);
  const patterns: Pattern[] = [];

  for (let i = 2; i < candles.length; i++) {
    const pattern = detectThreeBlackCrows(candles, i, config);
    if (pattern) {
      pattern.timestamp = ohlcvData[i].timestamp;
      pattern.price = ohlcvData[i].close;
      patterns.push(pattern);
    }
  }

  return patterns;
}

export default detectThreeBlackCrows;