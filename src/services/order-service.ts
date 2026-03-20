import { Order, Position, OrderResponse, PlaceOrderParams } from "../types";
import { getBinanceFuturesClient } from "./binance-futures";
import { getConfig } from "../config";

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
  trailingStopEnabled: boolean;
  trailingStopPercent: number;
  trailingStopPrice: number | null;
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
    const config = getConfig();

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
      trailingStopEnabled: config.trailingStopEnabled,
      trailingStopPercent: config.trailingStopPercent,
      trailingStopPrice: null,
      status: "OPEN",
      leverage,
      openedAt: new Date(),
      closedAt: null,
      pnl: null,
      binanceOrderId: orderResponse.orderId,
    };

    this.orders.set(order.id, order);

    // Validate SL/TP for position type
    if (stopLoss && takeProfit) {
      const isValid = positionSide === "LONG"
        ? stopLoss < entryPrice && takeProfit > entryPrice
        : takeProfit < entryPrice && stopLoss > entryPrice;

      if (!isValid) {
        console.warn(`   ⚠️ Invalid SL/TP configuration for ${positionSide} position. SL: ${stopLoss}, Entry: ${entryPrice}, TP: ${takeProfit}`);
      }
    }

    // Place stop-loss and take-profit orders separately (no OCO in Futures)
    // Using the algoOrder endpoint since 2025-12-09
    // Note: Don't pass positionSide - let Binance infer it from the order side
    if (stopLoss || takeProfit) {
      const closeSide = side === "BUY" ? "SELL" : "BUY";

      if (stopLoss) {
        try {
          await client.placeStopLossOrder(symbol, closeSide, quantity, stopLoss);
          console.log(`   ✅ Stop-loss order placed at ${stopLoss}`);
        } catch (error: any) {
          console.error(`   ❌ Failed to place stop-loss order:`, error.response?.data || error.message);
        }
      }

      if (takeProfit) {
        try {
          await client.placeTakeProfitOrder(symbol, closeSide, quantity, takeProfit);
          console.log(`   ✅ Take-profit order placed at ${takeProfit}`);
        } catch (error: any) {
          console.error(`   ❌ Failed to place take-profit order:`, error.response?.data || error.message);
        }
      }
    }

    // Place trailing stop if enabled
    if (config.trailingStopEnabled && config.trailingStopPercent > 0) {
      try {
        const closeSide = side === "BUY" ? "SELL" : "BUY";
        await client.placeTrailingStopOrder(
          symbol,
          closeSide,
          quantity,
          config.trailingStopPercent
        );
        console.log(`   ✅ Trailing stop placed at ${config.trailingStopPercent}%`);
      } catch (error: any) {
        console.error(`   ❌ Failed to place trailing stop:`, error.response?.data || error.message);
      }
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

  async checkStopLossTakeProfit(orderId: string, currentPrice: number): Promise<"NONE" | "STOP_LOSS" | "TAKE_PROFIT" | "TRAILING_STOP"> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== "OPEN") return "NONE";

    await this.updateOrderPrices(orderId, currentPrice);

    // Check trailing stop first (if enabled and we have a trailing stop price)
    if (order.trailingStopEnabled && order.trailingStopPrice) {
      if (order.type === "LONG" && currentPrice <= order.trailingStopPrice) {
        await this.closeOrder(orderId, "STOP_LOSS");
        console.log(`   🔴 Trailing stop triggered at ${currentPrice} (threshold: ${order.trailingStopPrice})`);
        return "TRAILING_STOP";
      }
      if (order.type === "SHORT" && currentPrice >= order.trailingStopPrice) {
        await this.closeOrder(orderId, "STOP_LOSS");
        console.log(`   🔴 Trailing stop triggered at ${currentPrice} (threshold: ${order.trailingStopPrice})`);
        return "TRAILING_STOP";
      }
    }

    // Check regular stop-loss
    if (order.stopLoss) {
      if (order.type === "LONG" && currentPrice <= order.stopLoss) {
        await this.closeOrder(orderId, "STOP_LOSS");
        console.log(`   🔴 Stop-loss triggered at ${currentPrice} (threshold: ${order.stopLoss})`);
        return "STOP_LOSS";
      }
      if (order.type === "SHORT" && currentPrice >= order.stopLoss) {
        await this.closeOrder(orderId, "STOP_LOSS");
        console.log(`   🔴 Stop-loss triggered at ${currentPrice} (threshold: ${order.stopLoss})`);
        return "STOP_LOSS";
      }
    }

    // Check take-profit
    if (order.takeProfit) {
      if (order.type === "LONG" && currentPrice >= order.takeProfit) {
        await this.closeOrder(orderId, "TAKE_PROFIT");
        console.log(`   🟢 Take-profit triggered at ${currentPrice} (threshold: ${order.takeProfit})`);
        return "TAKE_PROFIT";
      }
      if (order.type === "SHORT" && currentPrice <= order.takeProfit) {
        await this.closeOrder(orderId, "TAKE_PROFIT");
        console.log(`   🟢 Take-profit triggered at ${currentPrice} (threshold: ${order.takeProfit})`);
        return "TAKE_PROFIT";
      }
    }

    // Update trailing stop price if enabled and price is moving favorably
    if (order.trailingStopEnabled && order.trailingStopPercent > 0) {
      const newTrailingPrice = order.type === "LONG"
        ? currentPrice * (1 - order.trailingStopPercent / 100)
        : currentPrice * (1 + order.trailingStopPercent / 100);

      // Only update if the new trailing price is better (higher for LONG, lower for SHORT)
      const shouldUpdate = order.type === "LONG"
        ? !order.trailingStopPrice || newTrailingPrice > order.trailingStopPrice
        : !order.trailingStopPrice || newTrailingPrice < order.trailingStopPrice;

      if (shouldUpdate) {
        order.trailingStopPrice = newTrailingPrice;
        console.log(`   📈 Trailing stop updated to ${newTrailingPrice.toFixed(2)}`);
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