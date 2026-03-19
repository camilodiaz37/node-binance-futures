import dotenv from "dotenv";
import { BotConfig, StrategyConfig } from "../types/strategy";

dotenv.config();

export function getConfig(): BotConfig {
  const stage = process.env.STAGE || "dev";
  const isTestnet = stage === "dev";

  return {
    apiKey: isTestnet
      ? process.env.BINANCE_API_KEY || ""
      : process.env.BINANCE_API_KEY_PROD || "",
    apiSecret: isTestnet
      ? process.env.BINANCE_API_SECRET || ""
      : process.env.BINANCE_API_SECRET_PROD || "",
    testnet: isTestnet,
    leverage: parseInt(process.env.LEVERAGE || "10", 10),
    riskPercent: parseFloat(process.env.RISK_PERCENT || "2"),
    stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || "2"),
    takeProfitPercent: parseFloat(process.env.TAKE_PROFIT_PERCENT || "4"),
    executionInterval: parseInt(process.env.EXECUTION_INTERVAL || "15", 10),
    symbol: process.env.SYMBOL || "BTCUSDT",
  };
}

export function getStrategyConfig(): StrategyConfig {
  return {
    name: process.env.STRATEGY_NAME || "default",
    timeframe: process.env.TIMEFRAME || "1h",
    rsiPeriod: parseInt(process.env.RSI_PERIOD || "14", 10),
    rsiOverbought: parseInt(process.env.RSI_OVERBOUGHT || "70", 10),
    rsiOversold: parseInt(process.env.RSI_OVERSOLD || "30", 10),
    macdFast: parseInt(process.env.MACD_FAST || "12", 10),
    macdSlow: parseInt(process.env.MACD_SLOW || "26", 10),
    macdSignal: parseInt(process.env.MACD_SIGNAL || "9", 10),
    smaPeriod: parseInt(process.env.SMA_PERIOD || "50", 10),
  };
}