/**
 * OHLCV Validation Utilities
 */
import { OHLCV, Candle } from '../types';

/**
 * Validates a single OHLCV candle
 */
export function validateOHLCV(candle: OHLCV): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (candle.high < Math.max(candle.open, candle.close, candle.low)) {
    errors.push('high must be >= max(open, close, low)');
  }

  if (candle.low > Math.min(candle.open, candle.close, candle.high)) {
    errors.push('low must be <= min(open, close, high)');
  }

  if (candle.volume < 0) {
    errors.push('volume must be >= 0');
  }

  if (candle.timestamp < 0) {
    errors.push('timestamp must be >= 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an array of OHLCV candles (checks order and consistency)
 */
export function validateOHLCVArray(candles: OHLCV[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (candles.length < 3) {
    errors.push('Need at least 3 candles for pattern detection');
  }

  // Check timestamp order
  for (let i = 1; i < candles.length; i++) {
    if (candles[i].timestamp <= candles[i - 1].timestamp) {
      errors.push(`Timestamp not in ascending order at index ${i}`);
    }
  }

  // Validate each candle
  for (let i = 0; i < candles.length; i++) {
    const validation = validateOHLCV(candles[i]);
    if (!validation.valid) {
      errors.push(`Candle ${i}: ${validation.errors.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Converts OHLCV to Candle format for pattern detection
 */
export function toCandle(ohlcv: OHLCV): Candle {
  const open = ohlcv.open;
  const close = ohlcv.close;
  const high = ohlcv.high;
  const low = ohlcv.low;

  const body = Math.abs(close - open);
  const upperShadow = high - Math.max(open, close);
  const lowerShadow = Math.min(open, close) - low;

  return {
    open,
    high,
    low,
    close,
    body,
    upperShadow,
    lowerShadow,
    isBullish: close > open,
  };
}

/**
 * Converts array of OHLCV to Candle array
 */
export function toCandles(ohlcvArray: OHLCV[]): Candle[] {
  return ohlcvArray.map(toCandle);
}

/**
 * Checks if a candle body is "small" relative to its range
 */
export function isSmallBody(candle: Candle, threshold: number = 0.3): boolean {
  const range = candle.high - candle.low;
  if (range === 0) return true;
  return (candle.body / range) < threshold;
}

/**
 * Checks if a candle has a "long" body relative to its range
 */
export function isLongBody(candle: Candle, threshold: number = 0.6): boolean {
  const range = candle.high - candle.low;
  if (range === 0) return false;
  return (candle.body / range) > threshold;
}

/**
 * Checks if the second candle's body completely engulfs the first
 */
export function isEngulfing(first: Candle, second: Candle): boolean {
  const firstMin = Math.min(first.open, first.close);
  const firstMax = Math.max(first.open, first.close);
  const secondMin = Math.min(second.open, second.close);
  const secondMax = Math.max(second.open, second.close);

  return secondMin <= firstMin && secondMax >= firstMax;
}

/**
 * Checks if a candle opens within the body of another
 */
export function opensWithin(candle: Candle, reference: Candle): boolean {
  const refMin = Math.min(reference.open, reference.close);
  const refMax = Math.max(reference.open, reference.close);

  return candle.open >= refMin && candle.open <= refMax;
}

/**
 * Checks if a candle closes beyond the body of another
 */
export function closesBeyond(candle: Candle, reference: Candle): boolean {
  const refMin = Math.min(reference.open, reference.close);
  const refMax = Math.max(reference.open, reference.close);

  return candle.close > refMax || candle.close < refMin;
}