import crypto from "crypto";
import axios, { AxiosInstance } from "axios";
import { getConfig } from "../config";
import {
  OrderResponse,
  PlaceOrderParams,
  Position,
  AccountInfo,
  Kline,
  Ticker24hr,
  Order,
  CancelOrderResponse,
} from "../types";

const BINANCE_FUTURES_BASE_URL =
  process.env.STAGE === "dev"
    ? "https://testnet.binancefuture.com"
    : "https://fapi.binance.com";

class BinanceFuturesClient {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    const config = getConfig();
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.client = axios.create({
      baseURL: BINANCE_FUTURES_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "X-MBX-APIKEY": this.apiKey,
      },
    });
  }

  private createSignature(queryString: string): string {
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(queryString)
      .digest("hex");
  }

  private async signedGet<T>(
    endpoint: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const timestamp = Date.now();
    let queryString = `timestamp=${timestamp}`;

    if (params) {
      const paramString = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
      queryString += `&${paramString}`;
    }

    const signature = this.createSignature(queryString);
    const url = `${endpoint}?${queryString}&signature=${signature}`;

    const response = await this.client.get<T>(url);
    return response.data;
  }

  private async signedPost<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const timestamp = Date.now();
    let queryString = `timestamp=${timestamp}`;

    if (params) {
      const paramString = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
      queryString += `&${paramString}`;
    }

    const signature = this.createSignature(queryString);
    const url = `${endpoint}?${queryString}&signature=${signature}`;

    const response = await this.client.post<T>(url);
    return response.data;
  }

  private async signedDelete<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const timestamp = Date.now();
    let queryString = `timestamp=${timestamp}`;

    if (params) {
      const paramString = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
      queryString += `&${paramString}`;
    }

    const signature = this.createSignature(queryString);
    const url = `${endpoint}?${queryString}&signature=${signature}`;

    const response = await this.client.delete<T>(url);
    return response.data;
  }

  private async publicGet<T>(
    endpoint: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const paramString = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
      url += `?${paramString}`;
    }
    const response = await this.client.get<T>(url);
    return response.data;
  }

  // Account
  async getAccountInfo(): Promise<AccountInfo> {
    return this.signedGet<AccountInfo>("/fapi/v3/account");
  }

  async getBalance(): Promise<{ asset: string; balance: string }[]> {
    const account = await this.getAccountInfo();
    return account.positions
      .filter(
        (p) => parseFloat(p.positionAmt) !== 0 || parseFloat(p.notional) !== 0,
      )
      .map((p) => ({
        asset: p.symbol.replace("USDT", ""),
        balance: p.notional,
      }));
  }

  // Market Data
  async getKlines(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit: number = 500,
  ): Promise<Kline[]> {
    const params: Record<string, string | number> = {
      symbol,
      interval,
      limit,
    };

    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const data = await this.publicGet<any[][]>("/fapi/v1/klines", params);

    return data.map((k) => ({
      openTime: k[0],
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5],
      closeTime: k[6],
      quoteVolume: k[7],
      trades: k[8],
      takerBuyBaseVolume: k[9],
      takerBuyQuoteVolume: k[10],
    }));
  }

  async getTicker24hr(symbol: string): Promise<Ticker24hr> {
    return this.publicGet<Ticker24hr>("/fapi/v1/ticker/24hr", { symbol });
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const ticker = await this.getTicker24hr(symbol);
    return parseFloat(ticker.lastPrice);
  }

  async getMarkPrice(symbol: string): Promise<number> {
    const response = await this.publicGet<{ markPrice: string }[]>(
      "/fapi/v1/premiumIndex",
      { symbol },
    );
    return parseFloat(response[0].markPrice);
  }

  // Orders
  // Use /fapi/v1/order for MARKET/LIMIT, /fapi/v1/algoOrder for STOP/TAKE_PROFIT/TRAILING
  async placeOrder(params: PlaceOrderParams): Promise<OrderResponse> {
    const orderParams: Record<string, string | number | boolean> = {
      symbol: params.symbol,
      side: params.side,
      type: params.type,
      quantity: params.quantity,
    };

    if (params.price) orderParams.price = params.price;
    if (params.stopPrice) orderParams.stopPrice = params.stopPrice;
    if (params.timeInForce) orderParams.timeInForce = params.timeInForce;
    if (params.positionSide) orderParams.positionSide = params.positionSide;

    // Conditional orders (STOP, TAKE_PROFIT) must use algoOrder endpoint since 2025-12-09
    const isConditionalOrder = [
      "STOP",
      "STOP_MARKET",
      "TAKE_PROFIT",
      "TAKE_PROFIT_MARKET",
      "TRAILING_STOP_MARKET",
    ].includes(params.type);

    const endpoint = isConditionalOrder
      ? "/fapi/v1/algoOrder"
      : "/fapi/v1/order";

    if (isConditionalOrder) {
      // Add algoOrder specific parameters
      orderParams.algoType =
        params.type === "TRAILING_STOP_MARKET"
          ? "TRAILING_STOP_MARKET"
          : "CONDITIONAL";

      if (params.type === "TRAILING_STOP_MARKET") {
        // Placeholder - callbackRate must be set by caller
      }
    }

    return this.signedPost<OrderResponse>(endpoint, orderParams);
  }

  /**
   * Place stop-loss order using algoOrder endpoint
   */
  async placeStopLossOrder(
    symbol: string,
    side: "BUY" | "SELL",
    quantity: number,
    stopPrice: number,
    positionSide?: "LONG" | "SHORT",
  ): Promise<OrderResponse> {
    return this.signedPost<OrderResponse>("/fapi/v1/algoOrder", {
      symbol,
      side,
      quantity,
      type: "STOP_MARKET",
      triggerPrice: stopPrice,
      algoType: "CONDITIONAL",
      timeInForce: "GTC",
      reduceOnly: true, // Stop-loss should only reduce position
      ...(positionSide && { positionSide }),
    });
  }

  /**
   * Place take-profit order using algoOrder endpoint
   */
  async placeTakeProfitOrder(
    symbol: string,
    side: "BUY" | "SELL",
    quantity: number,
    stopPrice: number,
    positionSide?: "LONG" | "SHORT",
  ): Promise<OrderResponse> {
    return this.signedPost<OrderResponse>("/fapi/v1/algoOrder", {
      symbol,
      side,
      quantity,
      type: "TAKE_PROFIT_MARKET",
      triggerPrice: stopPrice,
      algoType: "CONDITIONAL",
      timeInForce: "GTC",
      reduceOnly: true, // Take-profit should only reduce position
      ...(positionSide && { positionSide }),
    });
  }

  /**
   * Place trailing stop order with configurable callback rate
   * Uses the algoOrder endpoint with TRAILING_STOP_MARKET type
   */
  async placeTrailingStopOrder(
    symbol: string,
    side: "BUY" | "SELL",
    quantity: number,
    callbackRate: number,
    positionSide?: "LONG" | "SHORT",
  ): Promise<OrderResponse> {
    return this.signedPost<OrderResponse>("/fapi/v1/algoOrder", {
      symbol,
      side,
      quantity,
      algoType: "CONDITIONAL",
      type: "TRAILING_STOP_MARKET",
      callbackRate,
      reduceOnly: true, // Trailing stop should only reduce position
      ...(positionSide && { positionSide }),
    });
  }

  async placeMarketOrder(
    symbol: string,
    side: "BUY" | "SELL",
    quantity: number,
    positionSide?: "LONG" | "SHORT",
  ): Promise<OrderResponse> {
    try {
      return await this.placeOrder({
        symbol,
        side,
        type: "MARKET",
        quantity,
        positionSide,
      });
    } catch (error: any) {
      // If error is about position side (-4061), retry without positionSide for One-Way Mode
      if (error.response?.data?.code === -4061 && positionSide) {
        console.log(
          "   ⚠️ Position side conflict, retrying in One-Way Mode...",
        );
        return this.placeOrder({
          symbol,
          side,
          type: "MARKET",
          quantity,
        });
      }
      throw error;
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    const params: Record<string, string> = {};
    if (symbol) params.symbol = symbol;
    return this.signedGet<Order[]>("/fapi/v1/openOrders", params);
  }

  async getAllOrders(
    symbol: string,
    startTime?: number,
    endTime?: number,
  ): Promise<Order[]> {
    const params: Record<string, string | number> = { symbol };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    return this.signedGet<Order[]>("/fapi/v1/allOrders", params);
  }

  async cancelOrder(
    symbol: string,
    orderId: number,
  ): Promise<CancelOrderResponse> {
    return this.signedPost<CancelOrderResponse>("/fapi/v1/order", {
      symbol,
      orderId,
    });
  }

  /**
   * Cancel all open TP/SL orders for a symbol (stop loss, take profit, trailing)
   */
  async cancelAllStopTakeProfitOrders(symbol: string): Promise<number> {
    const openOrders = await this.getOpenOrders(symbol);
    const algoOrderTypes = ["STOP", "STOP_MARKET", "TAKE_PROFIT", "TAKE_PROFIT_MARKET", "TRAILING_STOP_MARKET"];

    const tpSlOrders = openOrders.filter((order) =>
      algoOrderTypes.includes(order.type) ||
      (order.type === "STOP_MARKET" || order.type === "TAKE_PROFIT_MARKET")
    );

    let cancelledCount = 0;
    for (const order of tpSlOrders) {
      try {
        // Use the standard order endpoint for cancellation
        await this.signedDelete("/fapi/v1/order", {
          symbol,
          orderId: order.orderId,
        });
        cancelledCount++;
        console.log(`   🗑️ Cancelled ${order.type} order ${order.orderId}`);
      } catch (error: any) {
        console.warn(`   ⚠️ Failed to cancel order ${order.orderId}:`, error.response?.data?.msg || error.message);
      }
    }

    return cancelledCount;
  }

  // Positions
  async getPositions(symbol?: string): Promise<Position[]> {
    const account = await this.getAccountInfo();
    if (symbol) {
      return account.positions.filter(
        (p) => p.symbol === symbol && parseFloat(p.positionAmt) !== 0,
      );
    }
    return account.positions.filter((p) => parseFloat(p.positionAmt) !== 0);
  }

  async getPosition(symbol: string): Promise<Position | null> {
    const positions = await this.getPositions(symbol);
    return positions[0] || null;
  }

  // Leverage
  async setLeverage(symbol: string, leverage: number): Promise<any> {
    return this.signedPost("/fapi/v1/leverage", {
      symbol,
      leverage,
    });
  }

  async setMarginType(
    symbol: string,
    marginType: "CROSSED" | "ISOLATED",
  ): Promise<any> {
    return this.signedPost("/fapi/v1/marginType", {
      symbol,
      marginType,
    });
  }

  /**
   * Set position mode (Hedge Mode or One-way Mode)
   * @param dualSidePosition - "true" for Hedge Mode, "false" for One-way Mode
   */
  async setPositionMode(dualSidePosition: boolean): Promise<any> {
    return this.signedPost("/fapi/v1/positionSide/dual", {
      dualSidePosition: dualSidePosition ? "true" : "false",
    });
  }

  /**
   * Enable One-way Mode (recommended for this bot)
   */
  async enableOneWayMode(): Promise<any> {
    try {
      const result = await this.setPositionMode(false);
      console.log("   ✅ One-way Mode enabled");
      return result;
    } catch (error: any) {
      // Error code -4049 means already in One-way Mode
      if (error.response?.data?.code === -4049) {
        console.log("   ℹ️ Already in One-way Mode");
        return null;
      }
      throw error;
    }
  }

  /**
   * Enable Hedge Mode
   */
  async enableHedgeMode(): Promise<any> {
    try {
      const result = await this.setPositionMode(true);
      console.log("   ✅ Hedge Mode enabled");
      return result;
    } catch (error: any) {
      if (error.response?.data?.code === -4049) {
        console.log("   ℹ️ Already in Hedge Mode");
        return null;
      }
      throw error;
    }
  }
}

// Singleton instance
let clientInstance: BinanceFuturesClient | null = null;

export function getBinanceFuturesClient(): BinanceFuturesClient {
  if (!clientInstance) {
    clientInstance = new BinanceFuturesClient();
  }
  return clientInstance;
}

export { BinanceFuturesClient };
export default BinanceFuturesClient;
