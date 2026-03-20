// Trading Strategy Types

export interface BotConfig {
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  leverage: number;
  riskPercent: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  trailingStopPercent: number;
  trailingStopEnabled: boolean;
  executionInterval: number;
  symbol: string;
}

export interface StrategyConfig {
  name: string;
  timeframe: string;
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  smaPeriod: number;
}

export interface TradingSignal {
  type: "BUY" | "SELL" | "HOLD";
  strength: number;
  reason: string;
  indicators: {
    rsi: number;
    macd: number;
    signal: number;
    sma: number;
  };
}

export interface IndicatorValues {
  rsi: number;
  macd: number;
  signal: number;
  sma: number;
}