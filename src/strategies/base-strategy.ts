import { StrategyConfig, TradingSignal, IndicatorValues } from "../types/strategy";
import { calculateIndicators, detectTrend } from "../services/indicators";
import { Kline } from "../types";

export interface Strategy {
  name: string;
  config: StrategyConfig;
  analyze(klines: Kline[]): TradingSignal;
}

export class BaseStrategy implements Strategy {
  name: string;
  config: StrategyConfig;

  constructor(config?: Partial<StrategyConfig>) {
    this.name = config?.name || "default";
    this.config = {
      name: this.name,
      timeframe: config?.timeframe || "1h",
      rsiPeriod: config?.rsiPeriod || 14,
      rsiOverbought: config?.rsiOverbought || 70,
      rsiOversold: config?.rsiOversold || 30,
      macdFast: config?.macdFast || 12,
      macdSlow: config?.macdSlow || 26,
      macdSignal: config?.macdSignal || 9,
      smaPeriod: config?.smaPeriod || 50,
    };
  }

  analyze(klines: Kline[]): TradingSignal {
    if (klines.length < 100) {
      return {
        type: "HOLD",
        strength: 0,
        reason: "Insufficient data for analysis",
        indicators: { rsi: 50, macd: 0, signal: 0, sma: 0 },
      };
    }

    const indicators = calculateIndicators(klines, this.config);
    const trend = detectTrend(klines, this.config.smaPeriod);

    // Buy signals
    const buySignals: string[] = [];
    const sellSignals: string[] = [];

    // RSI oversold = potential buy
    if (indicators.rsi < this.config.rsiOversold) {
      buySignals.push(`RSI oversold (${indicators.rsi.toFixed(2)})`);
    }

    // RSI overbought = potential sell
    if (indicators.rsi > this.config.rsiOverbought) {
      sellSignals.push(`RSI overbought (${indicators.rsi.toFixed(2)})`);
    }

    // MACD crossing above signal = buy
    if (indicators.macd > indicators.signal && indicators.macd - indicators.signal > 0.5) {
      buySignals.push("MACD bullish cross");
    }

    // MACD crossing below signal = sell
    if (indicators.macd < indicators.signal && indicators.signal - indicators.macd > 0.5) {
      sellSignals.push("MACD bearish cross");
    }

    // Trend following
    if (trend === "UP") {
      buySignals.push("Uptrend detected");
    }
    if (trend === "DOWN") {
      sellSignals.push("Downtrend detected");
    }

    // Price above SMA = buy, below = sell
    const currentPrice = parseFloat(klines[klines.length - 1].close);
    if (currentPrice > indicators.sma) {
      buySignals.push("Price above SMA");
    } else {
      sellSignals.push("Price below SMA");
    }

    // Decision logic
    const buyScore = buySignals.length;
    const sellScore = sellSignals.length;

    if (buyScore >= 2 && buyScore > sellScore) {
      return {
        type: "BUY",
        strength: buyScore / 4,
        reason: buySignals.join(", "),
        indicators,
      };
    }

    if (sellScore >= 2 && sellScore > buyScore) {
      return {
        type: "SELL",
        strength: sellScore / 4,
        reason: sellSignals.join(", "),
        indicators,
      };
    }

    return {
      type: "HOLD",
      strength: 0,
      reason: buySignals.length > 0 || sellSignals.length > 0
        ? `Mixed signals - Buy: ${buyScore}, Sell: ${sellScore}`
        : "No clear signals",
      indicators,
    };
  }

  getConfig(): StrategyConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<StrategyConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Default strategy instance
let strategyInstance: BaseStrategy | null = null;

export function getStrategy(config?: Partial<StrategyConfig>): BaseStrategy {
  if (!strategyInstance) {
    strategyInstance = new BaseStrategy(config);
  }
  return strategyInstance;
}

export function createStrategy(config?: Partial<StrategyConfig>): BaseStrategy {
  return new BaseStrategy(config);
}