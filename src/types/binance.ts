// Binance API Response Types

export interface BinanceKline {
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

export interface BinanceAccountResponse {
  accountType: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
}

export interface BinanceOrderResponse {
  orderId: number;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET" | "STOP_MARKET" | "TAKE_PROFIT_MARKET";
  positionSide: "LONG" | "SHORT" | "BOTH";
  price: string;
  origQty: string;
  stopPrice: string;
  workingType: string;
  status: "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELED" | "REJECTED";
  clientOrderId: string;
  time: number;
  updateTime: number;
}

export interface BinancePositionResponse {
  entryPrice: string;
  marginType: string;
  isAutoAddMargin: boolean;
  isolatedMargin: string;
  leverage: string;
  liquidationPrice: string;
  markPrice: string;
  maxQty: string;
  positionAmt: string;
  symbol: string;
  unrealizedProfit: string;
  positionSide: "LONG" | "SHORT" | "BOTH";
}

export interface BinanceTickerPrice {
  symbol: string;
  price: string;
}

export interface BinanceExchangeInfo {
  timezone: string;
  serverTime: number;
  symbols: Array<{
    symbol: string;
    status: string;
    baseAsset: string;
    quoteAsset: string;
    contractType: "PERPETUAL";
    deliveryDate: number;
    onboardDate: number;
    contractStatus: string;
    contractSize: string;
  }>;
}

export interface BinanceMarkPrice {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  estimatedSettlePrice: string;
  lastFundingTime: number;
  nextFundingTime: number;
  interestRate: string;
  time: number;
}