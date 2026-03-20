import dotenv from "dotenv";
import { BotConfig, StrategyConfig } from "../types/strategy";

dotenv.config();

function validateConfig(config: BotConfig): void {
  // Validate trailing stop percent
  if (config.trailingStopPercent <= 0 || config.trailingStopPercent >= 100) {
    console.warn(`   ⚠️ TRAILING_STOP_PERCENT must be between 0 and 100. Using default 2%.`);
    config.trailingStopPercent = 2;
  }

  // Warn if stop-loss is greater than take-profit
  if (config.stopLossPercent >= config.takeProfitPercent) {
    console.warn(`   ⚠️ STOP_LOSS_PERCENT (${config.stopLossPercent}%) >= TAKE_PROFIT_PERCENT (${config.takeProfitPercent}%). This may result in unfavorable risk/reward ratio.`);
  }

  // Log risk parameters
  console.log(`   📊 Risk Configuration loaded:`);
  console.log(`      Stop-Loss: ${config.stopLossPercent}%`);
  console.log(`      Take-Profit: ${config.takeProfitPercent}%`);
  console.log(`      Trailing Stop: ${config.trailingStopEnabled ? config.trailingStopPercent + '%' : 'disabled'}`);
}

export function getConfig(): BotConfig {
  const stage = process.env.STAGE || "dev";
  const isTestnet = stage === "dev";

  const config: BotConfig = {
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
    trailingStopPercent: parseFloat(process.env.TRAILING_STOP_PERCENT || "2"),
    trailingStopEnabled: process.env.TRAILING_STOP_ENABLED === "true",
    executionInterval: parseInt(process.env.EXECUTION_INTERVAL || "15", 10),
    symbol: process.env.SYMBOL || "BTCUSDT",
  };

  validateConfig(config);

  return config;
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