import crypto from "crypto";
import type {
  TickerPrice,
  Ticker24hr,
  Kline,
  OrderBook,
  Order,
  OrderResponse,
  CancelOrderResponse,
  PlaceOrderParams,
  Position,
  AccountInfo,
  MarginType,
} from "./types";

// Re-export types for external use
export type {
  TickerPrice,
  Ticker24hr,
  Kline,
  OrderBook,
  Order,
  OrderResponse,
  CancelOrderResponse,
  PlaceOrderParams,
  Position,
  AccountInfo,
  MarginType,
};

// === Configuration ===

const API_BASE_URL =
  process.env.STAGE === "dev"
    ? "https://testnet.binance.vision"
    : "https://api.binance.com";

const FUTURES_API_BASE_URL =
  process.env.STAGE === "dev"
    ? "https://testnet.binancefuture.com"
    : "https://fapi.binance.com";

const API_KEY =
  process.env.STAGE === "dev"
    ? process.env.BINANCE_API_KEY
    : process.env.BINANCE_API_KEY_PROD;

const API_SECRET =
  process.env.STAGE === "dev"
    ? process.env.BINANCE_API_SECRET
    : process.env.BINANCE_API_SECRET_PROD;

const RECV_WINDOW = 5000;

// === Helper Functions ===

function createSignature(queryString: string): string {
  return crypto
    .createHmac("sha256", API_SECRET!)
    .update(queryString)
    .digest("hex");
}

function getHeaders(): HeadersInit {
  return {
    "X-MBX-APIKEY": API_KEY!,
    "Content-Type": "application/json",
  };
}

async function makeRequest<T>(
  endpoint: string,
  method: string = "GET",
  queryParams?: Record<string, string | number | undefined>,
): Promise<T> {
  if (!API_KEY || !API_SECRET) {
    throw new Error("Faltan API_KEY o API_SECRET");
  }

  const timestamp = Date.now();
  let url = `${FUTURES_API_BASE_URL}${endpoint}`;

  if (queryParams) {
    const filteredParams = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    if (filteredParams) {
      url += `?${filteredParams}&timestamp=${timestamp}&recvWindow=${RECV_WINDOW}`;
    } else {
      url += `?timestamp=${timestamp}&recvWindow=${RECV_WINDOW}`;
    }
  } else {
    url += `?timestamp=${timestamp}&recvWindow=${RECV_WINDOW}`;
  }

  const queryString = url.split("?")[1];
  const signature = createSignature(queryString);
  url += `&signature=${signature}`;

  const response = await fetch(url, {
    method,
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error de Binance: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// ============================================
// MARKET DATA (Public endpoints - no signature)
// ============================================

/**
 * Get current price for a symbol
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 */
export async function getTickerPrice(symbol: string): Promise<TickerPrice> {
  const url = `${API_BASE_URL}/api/v3/ticker/price?symbol=${symbol}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error de Binance: ${errorText}`);
  }

  return response.json();
}

/**
 * Get 24hr statistics for a symbol
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 */
export async function get24hrTicker(symbol: string): Promise<Ticker24hr> {
  const url = `${API_BASE_URL}/api/v3/ticker/24hr?symbol=${symbol}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error de Binance: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get klines/candlesticks for a symbol
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 * @param interval - Kline interval (1m, 5m, 15m, 1h, 4h, 1d)
 * @param limit - Number of klines to return (max 1500)
 */
export async function getKlines(
  symbol: string,
  interval: string = "1m",
  limit: number = 500,
): Promise<Kline[]> {
  const url = `${API_BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error de Binance: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  // Transform raw array to Kline objects
  return data.map((k: (string | number)[]) => ({
    openTime: k[0] as number,
    open: k[1] as string,
    high: k[2] as string,
    low: k[3] as string,
    close: k[4] as string,
    volume: k[5] as string,
    closeTime: k[6] as number,
    quoteVolume: k[7] as string,
    trades: k[8] as number,
    takerBuyBaseVolume: k[9] as string,
    takerBuyQuoteVolume: k[10] as string,
  }));
}

/**
 * Get order book depth for a symbol
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 * @param limit - Depth limit (5, 10, 20, 50, 100, 500, 1000)
 */
export async function getOrderBook(
  symbol: string,
  limit: number = 100,
): Promise<OrderBook> {
  const url = `${API_BASE_URL}/api/v3/depth?symbol=${symbol}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error de Binance: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// ============================================
// LEVERAGE (Signed endpoints)
// ============================================

/**
 * Set leverage for a symbol
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 * @param leverage - Leverage value (1-125)
 */
export async function setLeverage(
  symbol: string,
  leverage: number,
): Promise<{ symbol: string; leverage: number }> {
  if (leverage < 1 || leverage > 125) {
    throw new Error("El apalancamiento debe estar entre 1 y 125");
  }

  return makeRequest("/fapi/v1/leverage", "POST", {
    symbol,
    leverage,
  });
}

/**
 * Set margin type for a symbol
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 * @param marginType - "CROSSED" or "ISOLATED"
 */
export async function setMarginType(
  symbol: string,
  marginType: MarginType,
): Promise<{ symbol: string; marginType: string }> {
  if (marginType !== "CROSSED" && marginType !== "ISOLATED") {
    throw new Error("El tipo de margen debe ser 'CROSSED' o 'ISOLATED'");
  }

  return makeRequest("/fapi/v1/marginType", "POST", {
    symbol,
    marginType,
  });
}

// ============================================
// ORDERS (Signed endpoints)
// ============================================

/**
 * Place a new order
 * @param params - Order parameters
 */
export async function placeOrder(
  params: PlaceOrderParams,
): Promise<OrderResponse> {
  const {
    symbol,
    side,
    type,
    quantity,
    price,
    stopPrice,
    timeInForce,
    positionSide,
  } = params;

  const orderParams: Record<string, string | number | undefined> = {
    symbol,
    side,
    type,
    quantity,
  };

  if (price !== undefined) {
    orderParams.price = price;
  }

  if (stopPrice !== undefined) {
    orderParams.stopPrice = stopPrice;
  }

  if (timeInForce !== undefined) {
    orderParams.timeInForce = timeInForce;
  }

  if (positionSide !== undefined) {
    orderParams.positionSide = positionSide;
  }

  return makeRequest("/fapi/v1/order", "POST", orderParams);
}

/**
 * Cancel an order
 * @param symbol - Trading pair
 * @param orderId - Order ID to cancel
 */
export async function cancelOrder(
  symbol: string,
  orderId: number,
): Promise<CancelOrderResponse> {
  return makeRequest("/fapi/v1/order", "DELETE", {
    symbol,
    orderId,
  });
}

/**
 * Cancel all open orders for a symbol
 * @param symbol - Trading pair
 */
export async function cancelAllOrders(
  symbol: string,
): Promise<CancelOrderResponse[]> {
  return makeRequest("/fapi/v1/allOpenOrders", "DELETE", {
    symbol,
  });
}

/**
 * Get order status
 * @param symbol - Trading pair
 * @param orderId - Order ID to query
 */
export async function getOrder(
  symbol: string,
  orderId: number,
): Promise<Order> {
  return makeRequest("/fapi/v1/order", "GET", {
    symbol,
    orderId,
  });
}

/**
 * Get all open orders
 * @param symbol - Optional trading pair filter
 */
export async function getOpenOrders(symbol?: string): Promise<Order[]> {
  if (symbol) {
    return makeRequest("/fapi/v1/openOrders", "GET", { symbol });
  }
  return makeRequest("/fapi/v1/openOrders", "GET");
}

// ============================================
// POSITIONS (Signed endpoints)
// ============================================

/**
 * Get account and position information
 */
export async function getAccountInfo(): Promise<AccountInfo> {
  return makeRequest("/fapi/v2/account", "GET");
}

/**
 * Get positions
 * @param symbol - Optional trading pair filter
 */
export async function getPositions(symbol?: string): Promise<Position[]> {
  const accountInfo = await getAccountInfo();

  if (symbol) {
    return accountInfo.positions.filter((p: Position) => p.symbol === symbol);
  }

  return accountInfo.positions;
}
