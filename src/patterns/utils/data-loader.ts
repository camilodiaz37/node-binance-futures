/**
 * Data Loader Utilities
 */
import * as fs from 'fs';
import * as path from 'path';
import { OHLCV } from '../types';
import { validateOHLCVArray } from './validation';

export interface LoadOptions {
  validate?: boolean;
  sortByTimestamp?: boolean;
}

/**
 * Loads OHLCV data from a JSON file
 */
export function loadOHLCVFromFile(
  filePath: string,
  options: LoadOptions = {}
): OHLCV[] {
  const { validate = true, sortByTimestamp = true } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of OHLCV objects');
  }

  let candles: OHLCV[] = data;

  // Validate structure
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];
    if (
      typeof candle.timestamp !== 'number' ||
      typeof candle.open !== 'number' ||
      typeof candle.high !== 'number' ||
      typeof candle.low !== 'number' ||
      typeof candle.close !== 'number' ||
      typeof candle.volume !== 'number'
    ) {
      throw new Error(`Invalid OHLCV structure at index ${i}`);
    }
  }

  if (sortByTimestamp) {
    candles = [...candles].sort((a, b) => a.timestamp - b.timestamp);
  }

  if (validate) {
    const validation = validateOHLCVArray(candles);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  return candles;
}

/**
 * Saves OHLCV data to a JSON file
 */
export function saveOHLCVToFile(filePath: string, data: OHLCV[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Loads historical data from multiple files and combines them
 */
export function loadHistoricalData(
  dataDir: string,
  symbol: string,
  timeframe: string
): OHLCV[] {
  const filePath = path.join(dataDir, `${symbol}-${timeframe}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Historical data not found: ${filePath}`);
  }

  return loadOHLCVFromFile(filePath);
}

/**
 * Fetches OHLCV data from Binance API (if needed)
 */
export async function fetchFromBinance(
  symbol: string,
  interval: string,
  startTime: number,
  endTime: number
): Promise<OHLCV[]> {
  const axios = (await import('axios')).default;

  const url = 'https://fapi.binance.com/fapi/v1/klines';
  const response = await axios.get(url, {
    params: {
      symbol,
      interval,
      startTime,
      endTime,
      limit: 1000,
    },
  });

  return response.data.map((kline: (string | number)[]) => ({
    timestamp: kline[0] as number,
    open: parseFloat(kline[1] as string),
    high: parseFloat(kline[2] as string),
    low: parseFloat(kline[3] as string),
    close: parseFloat(kline[4] as string),
    volume: parseFloat(kline[5] as string),
  }));
}

/**
 * Downloads and saves historical data from Binance
 */
export async function downloadHistoricalData(
  symbol: string,
  interval: string,
  dataDir: string,
  days: number = 30
): Promise<string> {
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;

  const data = await fetchFromBinance(symbol, interval, startTime, endTime);

  const filePath = path.join(dataDir, `${symbol}-${interval}.json`);
  saveOHLCVToFile(filePath, data);

  return filePath;
}