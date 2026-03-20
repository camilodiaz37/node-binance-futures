import { Kline } from "./types";

/**
 * Datos históricos simulados - 40 Escenarios LARGOS (60 klines)
 * Cada escenario tiene suficiente longitud para que la estrategia funcione
 */

// Funciones generadoras
function generateLongUpTrend(startPrice: number, length: number = 60): Kline[] {
  const klines: Kline[] = [];
  let price = startPrice;
  let baseTime = Date.now() - length * 60000;

  for (let i = 0; i < length; i++) {
    const trend = 0.003;
    const noise = (Math.random() - 0.5) * 0.006;
    const pullback = i > 15 && i % 12 === 0 ? -0.008 : 0;
    const change = trend + noise + pullback;
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.abs(change) * 0.5);
    const low = Math.min(open, close) * (1 - Math.abs(change) * 0.5);

    klines.push({
      openTime: baseTime,
      open: open.toString(),
      high: high.toString(),
      low: low.toString(),
      close: close.toString(),
      volume: (Math.random() * 1000 + 500).toString(),
      closeTime: baseTime + 60000,
    });
    price = close;
    baseTime += 60000;
  }
  return klines;
}

function generateLongDownTrend(startPrice: number, length: number = 60): Kline[] {
  const klines: Kline[] = [];
  let price = startPrice;
  let baseTime = Date.now() - length * 60000;

  for (let i = 0; i < length; i++) {
    const trend = -0.003;
    const noise = (Math.random() - 0.5) * 0.006;
    const pullback = i > 15 && i % 12 === 0 ? 0.008 : 0;
    const change = trend + noise + pullback;
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.abs(change) * 0.5);
    const low = Math.min(open, close) * (1 - Math.abs(change) * 0.5);

    klines.push({
      openTime: baseTime,
      open: open.toString(),
      high: high.toString(),
      low: low.toString(),
      close: close.toString(),
      volume: (Math.random() * 1000 + 500).toString(),
      closeTime: baseTime + 60000,
    });
    price = close;
    baseTime += 60000;
  }
  return klines;
}

function generateLongRanging(startPrice: number, length: number = 60): Kline[] {
  const klines: Kline[] = [];
  let price = startPrice;
  let baseTime = Date.now() - length * 60000;
  const rangeSize = startPrice * 0.03;
  let inRange = startPrice;

  for (let i = 0; i < length; i++) {
    const direction = Math.sin(i * 0.3) * 0.004;
    const noise = (Math.random() - 0.5) * 0.002;
    const change = direction + noise;
    const open = price;
    const close = price * (1 + change);

    if (close > inRange + rangeSize) inRange = close - rangeSize * 0.5;
    else if (close < inRange - rangeSize) inRange = close + rangeSize * 0.5;

    const high = Math.max(open, close) * 1.002;
    const low = Math.min(open, close) * 0.998;

    klines.push({
      openTime: baseTime,
      open: open.toString(),
      high: high.toString(),
      low: low.toString(),
      close: close.toString(),
      volume: (Math.random() * 800 + 400).toString(),
      closeTime: baseTime + 60000,
    });
    price = close;
    baseTime += 60000;
  }
  return klines;
}

function generateLongVolatile(startPrice: number, length: number = 60): Kline[] {
  const klines: Kline[] = [];
  let price = startPrice;
  let baseTime = Date.now() - length * 60000;

  for (let i = 0; i < length; i++) {
    const bigMove = Math.random() > 0.7 ? (Math.random() - 0.5) * 0.03 : 0;
    const noise = (Math.random() - 0.5) * 0.01;
    const change = bigMove + noise;
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.abs(change) * 0.8);
    const low = Math.min(open, close) * (1 - Math.abs(change) * 0.8);

    klines.push({
      openTime: baseTime,
      open: open.toString(),
      high: high.toString(),
      low: low.toString(),
      close: close.toString(),
      volume: (Math.random() * 2000 + 1000).toString(),
      closeTime: baseTime + 60000,
    });
    price = close;
    baseTime += 60000;
  }
  return klines;
}

function generateLongLowVol(startPrice: number, length: number = 60): Kline[] {
  const klines: Kline[] = [];
  let price = startPrice;
  let baseTime = Date.now() - length * 60000;

  for (let i = 0; i < length; i++) {
    const trend = Math.sin(i * 0.1) * 0.001;
    const noise = (Math.random() - 0.5) * 0.001;
    const change = trend + noise;
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * 1.0005;
    const low = Math.min(open, close) * 0.9995;

    klines.push({
      openTime: baseTime,
      open: open.toString(),
      high: high.toString(),
      low: low.toString(),
      close: close.toString(),
      volume: (Math.random() * 400 + 200).toString(),
      closeTime: baseTime + 60000,
    });
    price = close;
    baseTime += 60000;
  }
  return klines;
}

// Exportar escenarios
export const scenarios: Record<string, Kline[]> = {
  // TRENDING UP (10 escenarios largos)
  bullish_volatile: generateLongUpTrend(42000),
  strong_uptrend: generateLongUpTrend(40000),
  gradual_rally: generateLongUpTrend(43000),
  break_out: generateLongUpTrend(44500),
  momentum_gap: generateLongUpTrend(41000),
  double_bottom_bounce: generateLongUpTrend(42000),
  ascending_triangle: generateLongUpTrend(44000),
  bullish_reversal: generateLongUpTrend(40000),
  trendline_support: generateLongUpTrend(43000),
  volume_surge: generateLongUpTrend(42000),

  // TRENDING DOWN (10 escenarios largos)
  bearish_volatile: generateLongDownTrend(48000),
  strong_downtrend: generateLongDownTrend(46000),
  gradual_decline: generateLongDownTrend(43000),
  break_down: generateLongDownTrend(41500),
  momentum_drop: generateLongDownTrend(45000),
  double_top_drop: generateLongDownTrend(44000),
  descending_triangle: generateLongDownTrend(42000),
  bearish_reversal: generateLongDownTrend(46000),
  trendline_resistance: generateLongDownTrend(43000),
  volume_surge_bearish: generateLongDownTrend(44000),

  // RANGING (10 escenarios largos)
  ranging: generateLongRanging(44000),
  consolidation: generateLongRanging(45000),
  channel_bound: generateLongRanging(44000),
  tight_range: generateLongRanging(44500),
  wide_range: generateLongRanging(43000),
  box_pattern: generateLongRanging(42000),
  flat_channel: generateLongRanging(45000),
  accumulating_range: generateLongRanging(44000),
  distributing_range: generateLongRanging(46000),
  neutral_market: generateLongRanging(44500),

  // HIGH VOLATILITY (5 escenarios largos)
  flash_crash: generateLongVolatile(50000),
  parabolic_rally: generateLongVolatile(40000),
  volatile_spike: generateLongVolatile(45000),
  news_gap: generateLongVolatile(43000),
  whipsaw: generateLongVolatile(44000),

  // LOW VOLATILITY (5 escenarios largos)
  calm_uptrend: generateLongLowVol(42000),
  calm_downtrend: generateLongLowVol(44000),
  quiet_range: generateLongLowVol(45000),
  low_volatility: generateLongLowVol(43500),
  squeeze_pattern: generateLongLowVol(44000),
};

export function getScenario(name: string): Kline[] | undefined {
  return scenarios[name];
}

export function getAllScenarios(): string[] {
  return Object.keys(scenarios);
}