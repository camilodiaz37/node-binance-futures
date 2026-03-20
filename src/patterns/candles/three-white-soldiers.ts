/**
 * Three White Soldiers Pattern Detector
 *
 * Pattern: Three consecutive bullish candles where each opens within the previous candle's body
 * and closes higher than the previous close
 * Direction: BULLISH (continuation or reversal)
 */
import { Candle, Pattern } from '../types';
import { isLongBody, opensWithin, toCandle } from '../utils/validation';

export interface ThreeWhiteSoldiersConfig {
  minBodySize?: number;  // Minimum body size relative to range
}

/**
 * Detects Three White Soldiers pattern
 * Returns the pattern if found, null otherwise
 */
export function detectThreeWhiteSoldiers(
  candles: Candle[],
  index: number,
  config: ThreeWhiteSoldiersConfig = {}
): Pattern | null {
  const { minBodySize = 0.5 } = config;

  // Need at least 3 candles
  if (index < 2 || index >= candles.length) {
    return null;
  }

  const first = candles[index - 2];
  const second = candles[index - 1];
  const third = candles[index];

  // All three must be bullish
  if (!first.isBullish || !second.isBullish || !third.isBullish) {
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

  // Each closes higher than the previous
  if (!(second.close > first.close && third.close > second.close)) {
    return null;
  }

  // Calculate confidence based on consistency
  const avgGain = ((second.close - second.open) + (third.close - third.open)) / 2;
  const confidence = Math.min(1, avgGain / 100);

  return {
    type: 'THREE_WHITE_SOLDIERS',
    direction: 'BULLISH',
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
 * Detects all Three White Soldiers patterns in a candle array
 */
export function detectAllThreeWhiteSoldiers(
  ohlcvData: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[],
  config: ThreeWhiteSoldiersConfig = {}
): Pattern[] {
  const candles = ohlcvData.map(toCandle);
  const patterns: Pattern[] = [];

  for (let i = 2; i < candles.length; i++) {
    const pattern = detectThreeWhiteSoldiers(candles, i, config);
    if (pattern) {
      pattern.timestamp = ohlcvData[i].timestamp;
      pattern.price = ohlcvData[i].close;
      patterns.push(pattern);
    }
  }

  return patterns;
}

export default detectThreeWhiteSoldiers;