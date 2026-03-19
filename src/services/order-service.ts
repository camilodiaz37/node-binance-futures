import { Order, Position, OrderResponse, PlaceOrderParams } from "../types";
import { getBinanceFuturesClient } from "./binance-futures";

export type OrderStatus = "PENDING" | "OPEN" | "CLOSED" | "CANCELLED";

export interface ManagedOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LONG" | "SHORT";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  status: OrderStatus;
  leverage: number;
  openedAt: Date;
  closedAt: Date | null;
  pnl: number | null;
  binanceOrderId: number;
}

export interface OrderUpdate {
  orderId: string;
  status: OrderStatus;
  currentPrice?: number;
  pnl?: number;
}

class OrderService {
  private orders: Map<string, ManagedOrder> = new Map();

  async openOrder(
    symbol: string,
    side: "BUY" | "SELL",
    quantity: number,
    entryPrice: number,
    stopLoss: number | null,
    takeProfit: number | null,
    leverage: number = 10
  ): Promise<ManagedOrder> {
    const client = getBinanceFuturesClient();

    // Set leverage
    await client.setLeverage(symbol, leverage);

    const positionSide = side === "BUY" ? "LONG" : "SHORT";

    // Place market order
    const orderResponse = await client.placeMarketOrder(symbol, side, quantity, positionSide);

    const order: ManagedOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      side,
      type: positionSide,
      quantity,
      entryPrice,
      currentPrice: entryPrice,
      stopLoss,
      takeProfit,
      status: "OPEN",
      leverage,
      openedAt: new Date(),
      closedAt: null,
      pnl: null,
      binanceOrderId: orderResponse.orderId,
    };

    this.orders.set(order.id, order);

    // Place SL/TP orders if provided
    if (stopLoss) {
      await client.placeStopLossOrder(
        symbol,
        side === "BUY" ? "SELL" : "BUY",
        quantity,
        stopLoss,
        positionSide
      );
    }

    if (takeProfit) {
      await client.placeTakeProfitOrder(
        symbol,
        side === "BUY" ? "SELL" : "BUY",
        quantity,
        takeProfit,
        positionSide
      );
    }

    return order;
  }

  async closeOrder(orderId: string, reason: "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT"): Promise<ManagedOrder | null> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== "OPEN") return null;

    const client = getBinanceFuturesClient();
    const closeSide = order.side === "BUY" ? "SELL" : "BUY";

    try {
      await client.placeMarketOrder(order.symbol, closeSide, order.quantity);
    } catch (error) {
      console.error(`Error closing order ${orderId}:`, error);
    }

    order.status = "CLOSED";
    order.closedAt = new Date();

    // Calculate PnL
    const currentPrice = await client.getCurrentPrice(order.symbol);
    const priceDiff = order.type === "LONG"
      ? currentPrice - order.entryPrice
      : order.entryPrice - currentPrice;

    order.pnl = priceDiff * order.quantity * order.leverage;
    order.currentPrice = currentPrice;

    return order;
  }

  async updateOrderPrices(orderId: string, currentPrice: number): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== "OPEN") return;

    order.currentPrice = currentPrice;

    // Calculate unrealized PnL
    const priceDiff = order.type === "LONG"
      ? currentPrice - order.entryPrice
      : order.entryPrice - currentPrice;

    order.pnl = priceDiff * order.quantity * order.leverage;
  }

  async checkStopLossTakeProfit(orderId: string, currentPrice: number): Promise<"NONE" | "STOP_LOSS" | "TAKE_PROFIT"> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== "OPEN") return "NONE";

    await this.updateOrderPrices(orderId, currentPrice);

    if (order.stopLoss) {
      if (order.type === "LONG" && currentPrice <= order.stopLoss) {
        await this.closeOrder(orderId, "STOP_LOSS");
        return "STOP_LOSS";
      }
      if (order.type === "SHORT" && currentPrice >= order.stopLoss) {
        await this.closeOrder(orderId, "STOP_LOSS");
        return "STOP_LOSS";
      }
    }

    if (order.takeProfit) {
      if (order.type === "LONG" && currentPrice >= order.takeProfit) {
        await this.closeOrder(orderId, "TAKE_PROFIT");
        return "TAKE_PROFIT";
      }
      if (order.type === "SHORT" && currentPrice <= order.takeProfit) {
        await this.closeOrder(orderId, "TAKE_PROFIT");
        return "TAKE_PROFIT";
      }
    }

    return "NONE";
  }

  getOrder(orderId: string): ManagedOrder | undefined {
    return this.orders.get(orderId);
  }

  getOpenOrders(): ManagedOrder[] {
    return Array.from(this.orders.values()).filter((o) => o.status === "OPEN");
  }

  getClosedOrders(): ManagedOrder[] {
    return Array.from(this.orders.values()).filter((o) => o.status === "CLOSED");
  }

  hasOpenPosition(symbol: string): boolean {
    return this.getOpenOrders().some((o) => o.symbol === symbol);
  }

  async syncWithBinance(): Promise<void> {
    const client = getBinanceFuturesClient();
    const positions = await client.getPositions();

    // Close orders that are no longer in Binance
    for (const order of this.getOpenOrders()) {
      const stillOpen = positions.some(
        (p) => p.symbol === order.symbol && parseFloat(p.positionAmt) !== 0
      );

      if (!stillOpen) {
        order.status = "CLOSED";
        order.closedAt = new Date();
      }
    }
  }
}

// Singleton instance
let orderServiceInstance: OrderService | null = null;

export function getOrderService(): OrderService {
  if (!orderServiceInstance) {
    orderServiceInstance = new OrderService();
  }
  return orderServiceInstance;
}

export default OrderService;