export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  roi: number;
  trades: TradeResult[];
}

export interface TradeResult {
  type: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit: number;
  profitPercent: number;
  entryTime: string;
  exitTime: string;
}

export interface BacktestConfig {
  initialBalance: number;
  leverage: number;
  positionSizePercent: number;
  bbPeriod: number;
  bbStdDev: number;
  rsiPeriod: number;
  rsiOversold: number;
  rsiOverbought: number;
  minDistance: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  feePercent: number;
}

/**
 * Market condition types for scenario categorization
 */
export enum MarketCondition {
  TRENDING_UP = "trending_up",
  TRENDING_DOWN = "trending_down",
  RANGING = "ranging",
  HIGH_VOLATILITY = "high_volatility",
  LOW_VOLATILITY = "low_volatility",
}

/**
 * Extended trade result with exit reason and market condition
 */
export interface TradeResultExtended extends TradeResult {
  exitReason: "stop_loss" | "take_profit" | "signal";
  marketCondition: MarketCondition;
}

/**
 * Scenario metadata for tracking
 */
export interface ScenarioMetadata {
  name: string;
  condition: MarketCondition;
  description: string;
}

/**
 * Extended backtest result with scenario metadata
 */
export interface BacktestResultExtended extends Omit<BacktestResult, "trades"> {
  scenarioName: string;
  scenarioCondition: MarketCondition;
  trades: TradeResultExtended[];
  slTriggered: number;
  tpTriggered: number;
  signalClosed: number;
}

/**
 * Analysis report with strategy recommendations
 */
export interface AnalysisReport {
  totalScenarios: number;
  totalTrades: number;
  overallWinRate: number;
  totalNetProfit: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  winRateByCondition: Record<MarketCondition, number>;
  slTriggeredPercent: number;
  tpTriggeredPercent: number;
  recommendations: string[];
}