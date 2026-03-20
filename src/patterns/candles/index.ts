/**
 * Candle Pattern Detection Module
 *
 * Unified interface for all candle pattern detectors
 */
import { Pattern, PatternType } from '../types';
import { toCandle } from '../utils/validation';

import { detectMorningStar, detectAllMorningStars, MorningStarConfig } from './morning-star';
import { detectEveningStar, detectAllEveningStars, EveningStarConfig } from './evening-star';
import { detectEngulfing, detectAllEngulfings, EngulfingConfig } from './engulfing';
import { detectThreeWhiteSoldiers, detectAllThreeWhiteSoldiers, ThreeWhiteSoldiersConfig } from './three-white-soldiers';
import { detectThreeBlackCrows, detectAllThreeBlackCrows, ThreeBlackCrowsConfig } from './three-black-crows';

export interface CandlePatternConfig {
  morningStar?: MorningStarConfig;
  eveningStar?: EveningStarConfig;
  engulfing?: EngulfingConfig;
  threeWhiteSoldiers?: ThreeWhiteSoldiersConfig;
  threeBlackCrows?: ThreeBlackCrowsConfig;
}

export interface DetectionOptions {
  patternTypes?: PatternType[];
  config?: CandlePatternConfig;
}

/**
 * Detects all candle patterns at a specific index
 */
export function detectAllCandlePatternsAtIndex(
  candles: ReturnType<typeof toCandle>[],
  index: number,
  config: CandlePatternConfig = {}
): Pattern[] {
  const patterns: Pattern[] = [];

  // Morning Star
  const morningStar = detectMorningStar(candles, index, config.morningStar);
  if (morningStar) patterns.push(morningStar);

  // Evening Star
  const eveningStar = detectEveningStar(candles, index, config.eveningStar);
  if (eveningStar) patterns.push(eveningStar);

  // Engulfing
  const engulfing = detectEngulfing(candles, index, config.engulfing);
  if (engulfing) patterns.push(engulfing);

  // Three White Soldiers
  const threeWhiteSoldiers = detectThreeWhiteSoldiers(candles, index, config.threeWhiteSoldiers);
  if (threeWhiteSoldiers) patterns.push(threeWhiteSoldiers);

  // Three Black Crows
  const threeBlackCrows = detectThreeBlackCrows(candles, index, config.threeBlackCrows);
  if (threeBlackCrows) patterns.push(threeBlackCrows);

  return patterns;
}

/**
 * Detects all candle patterns in OHLCV data
 */
export function detectAllCandlePatterns(
  ohlcvData: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[],
  options: DetectionOptions = {}
): Pattern[] {
  const { config = {} } = options;
  const candles = ohlcvData.map(toCandle);
  const allPatterns: Pattern[] = [];

  // Need at least 3 candles for any pattern
  for (let i = 2; i < candles.length; i++) {
    const patterns = detectAllCandlePatternsAtIndex(candles, i, config);

    for (const pattern of patterns) {
      // Set timestamp and price from original data
      pattern.timestamp = ohlcvData[i].timestamp;
      pattern.price = ohlcvData[i].close;
      allPatterns.push(pattern);
    }
  }

  // Sort by timestamp
  allPatterns.sort((a, b) => a.timestamp - b.timestamp);

  return allPatterns;
}

/**
 * Detects only specific pattern types
 */
export function detectSpecificPatterns(
  ohlcvData: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[],
  patternTypes: PatternType[],
  config: CandlePatternConfig = {}
): Pattern[] {
  const allPatterns = detectAllCandlePatterns(ohlcvData, { config });

  return allPatterns.filter(p => patternTypes.includes(p.type));
}

// Export individual detectors for testing
export {
  detectMorningStar,
  detectAllMorningStars,
  detectEveningStar,
  detectAllEveningStars,
  detectEngulfing,
  detectAllEngulfings,
  detectThreeWhiteSoldiers,
  detectAllThreeWhiteSoldiers,
  detectThreeBlackCrows,
  detectAllThreeBlackCrows,
};

export default detectAllCandlePatterns;