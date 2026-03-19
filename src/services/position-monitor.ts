import { getBinanceFuturesClient } from "./binance-futures";
import { getOrderService, ManagedOrder } from "./order-service";
import { getConfig } from "../config";

export type CloseReason = "STOP_LOSS" | "TAKE_PROFIT" | "LIQUIDATION" | "MANUAL";

export interface PositionUpdate {
  orderId: string;
  currentPrice: number;
  unrealizedPnl: number;
  liquidationPrice?: number;
}

/**
 * Monitor open positions and check for SL/TP triggers
 */
export async function monitorPositions(): Promise<{
  updates: PositionUpdate[];
  triggered: { orderId: string; reason: CloseReason }[];
}> {
  const config = getConfig();
  const client = getBinanceFuturesClient();
  const orderService = getOrderService();

  const openOrders = orderService.getOpenOrders();
  const updates: PositionUpdate[] = [];
  const triggered: { orderId: string; reason: CloseReason }[] = [];

  if (openOrders.length === 0) {
    return { updates: [], triggered: [] };
  }

  const currentPrice = await client.getCurrentPrice(config.symbol);

  for (const order of openOrders) {
    // Calculate PnL
    const priceDiff = order.type === "LONG"
      ? currentPrice - order.entryPrice
      : order.entryPrice - currentPrice;

    const unrealizedPnl = priceDiff * order.quantity * order.leverage;

    // Calculate liquidation price
    const liquidationPrice = calculateLiquidationPrice(
      order.entryPrice,
      order.type,
      order.leverage
    );

    // Check liquidation
    const isLiquidated = order.type === "LONG"
      ? currentPrice <= liquidationPrice
      : currentPrice >= liquidationPrice;

    if (isLiquidated) {
      await orderService.closeOrder(order.id, "STOP_LOSS");
      triggered.push({ orderId: order.id, reason: "LIQUIDATION" });
      console.log(`⚠️ POSICIÓN LIQUIDADA: $${currentPrice.toFixed(2)}`);
      continue;
    }

    // Check SL/TP
    const triggerResult = await orderService.checkStopLossTakeProfit(order.id, currentPrice);

    if (triggerResult !== "NONE") {
      triggered.push({ orderId: order.id, reason: triggerResult === "STOP_LOSS" ? "STOP_LOSS" : "TAKE_PROFIT" });
      console.log(`⚠️ Posición cerrada por ${triggerResult}`);
    } else {
      updates.push({
        orderId: order.id,
        currentPrice,
        unrealizedPnl,
        liquidationPrice,
      });
    }
  }

  return { updates, triggered };
}

/**
 * Calculate liquidation price based on leverage and position side
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  side: "LONG" | "SHORT",
  leverage: number
): number {
  // Liquidation occurs when loss equals margin
  // With leverage L, liquidation happens at 1/L loss percentage
  const liquidationPercent = 100 / leverage;

  if (side === "LONG") {
    return entryPrice * (1 - liquidationPercent / 100);
  } else {
    return entryPrice * (1 + liquidationPercent / 100);
  }
}

/**
 * Get current position metrics
 */
export async function getPositionMetrics(orderId: string): Promise<{
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  liquidationPrice: number;
  distanceToLiquidation: number;
  distanceToStopLoss: number;
  distanceToTakeProfit: number;
} | null> {
  const orderService = getOrderService();
  const order = orderService.getOrder(orderId);

  if (!order || order.status !== "OPEN") return null;

  const client = getBinanceFuturesClient();
  const config = getConfig();
  const currentPrice = await client.getCurrentPrice(config.symbol);

  const priceDiff = order.type === "LONG"
    ? currentPrice - order.entryPrice
    : order.entryPrice - currentPrice;

  const unrealizedPnl = priceDiff * order.quantity * order.leverage;
  const unrealizedPnlPercent = (priceDiff / order.entryPrice) * 100;

  const liquidationPrice = calculateLiquidationPrice(order.entryPrice, order.type, order.leverage);
  const distanceToLiquidation = order.type === "LONG"
    ? ((currentPrice - liquidationPrice) / currentPrice) * 100
    : ((liquidationPrice - currentPrice) / currentPrice) * 100;

  const distanceToStopLoss = order.stopLoss
    ? (order.type === "LONG"
      ? ((order.stopLoss - currentPrice) / currentPrice) * 100
      : ((currentPrice - order.stopLoss) / currentPrice) * 100)
    : 0;

  const distanceToTakeProfit = order.takeProfit
    ? (order.type === "LONG"
      ? ((order.takeProfit - currentPrice) / currentPrice) * 100
      : ((currentPrice - order.takeProfit) / currentPrice) * 100)
    : 0;

  return {
    currentPrice,
    unrealizedPnl,
    unrealizedPnlPercent,
    liquidationPrice,
    distanceToLiquidation,
    distanceToStopLoss,
    distanceToTakeProfit,
  };
}

/**
 * Start position monitoring loop
 */
let monitorInterval: NodeJS.Timeout | null = null;

export function startPositionMonitor(intervalMs: number = 30000): void {
  if (monitorInterval) {
    console.log("⚠️ Monitor ya está corriendo");
    return;
  }

  console.log(`📊 Iniciando monitor de posiciones (cada ${intervalMs / 1000}s)`);

  const loop = async () => {
    try {
      const result = await monitorPositions();

      for (const update of result.updates) {
        const pnlEmoji = update.unrealizedPnl >= 0 ? "🟢" : "🔴";
        console.log(
          `${pnlEmoji} PnL: $${update.unrealizedPnl.toFixed(2)} | ` +
          `Liquidación: $${update.liquidationPrice?.toFixed(2)}`
        );
      }

      for (const trigger of result.triggered) {
        console.log(`🚨 Posición ${trigger.orderId} cerrada por ${trigger.reason}`);
      }
    } catch (error: any) {
      console.error("Error en monitor de posiciones:", error.message);
    }
  };

  monitorInterval = setInterval(loop, intervalMs);
}

export function stopPositionMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log("🛑 Monitor de posiciones detenido");
  }
}