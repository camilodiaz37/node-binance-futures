/**
 * TypeScript interfaces for Binance Futures API responses
 */

// === Market Data Types ===

export interface TickerPrice {
  symbol: string;
  price: string;
}

export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  trades: number;
  takerBuyBaseVolume: string;
  takerBuyQuoteVolume: string;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

// === Order Types ===

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT' | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';
export type MarginType = 'CROSSED' | 'ISOLATED';
export type PositionSide = 'BOTH' | 'LONG' | 'SHORT';

export interface PlaceOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  positionSide?: PositionSide;
}

export interface OrderResponse {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  avgPrice: string;
  origQty: string;
  executedQty: string;
  cumQty: string;
  cumQuote: string;
  side: OrderSide;
  positionSide: PositionSide;
  type: OrderType;
  reduceOnly: boolean;
  closePosition: boolean;
  sideEffectType: string;
  timeInForce: TimeInForce;
  stopPrice: string;
  workingType: string;
  priceMatch: string;
  selfTradePreventionMode: string;
  goodTillDate: number;
  updateTime: number;
  isWorking: boolean;
  locked: boolean;
}

export interface CancelOrderResponse {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  side: OrderSide;
  type: OrderType;
  timeInForce: TimeInForce;
  price: string;
  stopPrice: string;
  workingType: string;
  priceProtect: string;
}

export interface Order {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  side: OrderSide;
  positionSide: PositionSide;
  type: OrderType;
  timeInForce: TimeInForce;
  quantity: string;
  price: string;
  stopPrice: string;
  workingType: string;
  priceProtect: string;
  closePosition: string;
  updateTime: number;
  avgPrice: string;
}

// === Position Types ===

export interface Position {
  symbol: string;
  positionSide: PositionSide;
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  notional: string;
  isolatedWallet: string;
  updateTime: number;
  isAutoAddMargin: number;
  marginType: MarginType;
  notionalValue: string;
 isolated: boolean;
  leverage: string;
  LiquidationPrice: string;
}

export interface AccountInfo {
  feeTier: number;
  canTrade: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  updateTime: number;
  totalInitialMargin: string;
  totalMaintMargin: string;
  totalWalletBalance: string;
  totalUnrealizedPnl: string;
  totalMarginBalance: string;
  totalPositionInitialMargin: string;
  totalOpenOrderInitialMargin: string;
  totalCrossWalletBalance: string;
  totalCrossUnrealizedPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  positions: Position[];
}