/**
 * Types for Pattern Detection and Backtesting System
 */

// OHLCV Data Input
export interface OHLCV {
  timestamp: number;  // Unix timestamp (ms)
  open: number;       // Opening price
  high: number;       // Highest price
  low: number;        // Lowest price
  close: number;     // Closing price
  volume: number;    // Trading volume
}

// Pattern Types
export type PatternType =
  | 'MORNING_STAR'
  | 'EVENING_STAR'
  | 'BULLISH_ENGULFING'
  | 'BEARISH_ENGULFING'
  | 'THREE_WHITE_SOLDIERS'
  | 'THREE_BLACK_CROWS'
  | 'BULLISH_RECTANGLE'
  | 'BEARISH_RECTANGLE'
  | 'BULLISH_FLAG'
  | 'BEARISH_FLAG';

export type PatternDirection = 'BULLISH' | 'BEARISH';

export interface Pattern {
  type: PatternType;
  direction: PatternDirection;
  timestamp: number;  // When pattern completed
  price: number;      // Activation price
  confidence: number; // 0-1, based on pattern clarity
  metadata?: Record<string, unknown>;
}

// Backtest Parameters
export type Timeframe = '1m' | '5m' | '15m';

export interface BacktestParams {
  stopLossPercent: number;      // 0.5 to 3.0
  takeProfitPercent: number;    // 1.0 to 5.0
  timeframe: Timeframe;
  positionSizePercent: number;  // 1 to 100
}

// Backtest Result
export interface BacktestResult {
  pattern: PatternType;
  params: BacktestParams;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  totalPnL: number;
}

// Optimization Result
export interface OptimizationResult {
  pattern: PatternType;
  topConfigs: BacktestResult[];
  bestByWinRate: BacktestResult;
  bestByProfitFactor: BacktestResult;
  trainingWinRate: number;
  testWinRate: number;
  overfittingDetected: boolean;
}

// Pattern detection result for a single candle
export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  body: number;       // |close - open|
  upperShadow: number;  // high - max(open, close)
  lowerShadow: number;  // min(open, close) - low
  isBullish: boolean;   // close > open
}

// Helper type for pattern detector function
export type PatternDetector = (candles: Candle[], index: number) => Pattern | null;