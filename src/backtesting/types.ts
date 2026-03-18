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