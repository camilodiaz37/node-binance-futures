import { getBinanceFuturesClient } from "./binance-futures";
import { getOrderService, ManagedOrder } from "./order-service";
import { getConfig } from "../config";

export interface TradeResult {
  success: boolean;
  order?: ManagedOrder;
  error?: string;
}

/**
 * Calculate position size based on actual wallet balance and risk parameters
 * The position size is limited to what's actually available in the wallet
 * and optionally limited by maxPerPosition
 */
export function calculatePositionSize(
  availableBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPercent: number,
  leverage: number = 1,
  maxPerPosition: number = 0,  // Maximum amount per position in USDT. 0 = no limit
): number {
  // Calculate position value based on risk amount (not leverage)
  const riskAmount = availableBalance * (riskPercent / 100);
  const priceRiskPerUnit = entryPrice * (stopLossPercent / 100);
  const quantityFromRisk = riskAmount / priceRiskPerUnit;

  // Calculate max position based on available balance (without leverage)
  const maxPositionFromBalance = availableBalance / entryPrice;

  let baseQuantity: number;

  if (maxPerPosition > 0) {
    // maxPerPosition is the maximum NOTIONAL value (before leverage)
    // Convert to quantity by dividing by price
    const maxPositionFromLimit = maxPerPosition / entryPrice;

    // Use the smaller of risk-based or limit-based
    baseQuantity = Math.min(quantityFromRisk, maxPositionFromBalance, maxPositionFromLimit);
  } else {
    // No maxPerPosition - use risk-based calculation
    baseQuantity = Math.min(quantityFromRisk, maxPositionFromBalance);
  }

  // Don't floor when using maxPerPosition to preserve precision for validation
  if (maxPerPosition > 0) {
    return baseQuantity;
  }

  // Round to 3 decimal places (Binance minimum is 0.001)
  return Math.floor(baseQuantity * 1000) / 1000;
}

/**
 * Returns the effective max per position, ensuring it meets Binance minimum
 */
export function getEffectiveMaxPerPosition(configuredMax: number): number {
  const BINANCE_MIN_NOTIONAL = 100;
  // Si maxPerPosition es menor que el mínimo de Binance, usar el mínimo
  return configuredMax > 0 && configuredMax < BINANCE_MIN_NOTIONAL
    ? BINANCE_MIN_NOTIONAL
    : configuredMax;
}

/**
 * Calculate stop loss and take profit prices
 */
export function calculateStopLossTakeProfit(
  entryPrice: number,
  side: "BUY" | "SELL",
  stopLossPercent: number,
  takeProfitPercent: number,
): { stopLoss: number; takeProfit: number } {
  const precision = 2; // BTCUSDT uses 2 decimal places

  if (side === "BUY") {
    return {
      stopLoss: Number((entryPrice * (1 - stopLossPercent / 100)).toFixed(precision)),
      takeProfit: Number((entryPrice * (1 + takeProfitPercent / 100)).toFixed(precision)),
    };
  } else {
    return {
      stopLoss: Number((entryPrice * (1 + stopLossPercent / 100)).toFixed(precision)),
      takeProfit: Number((entryPrice * (1 - takeProfitPercent / 100)).toFixed(precision)),
    };
  }
}

/**
 * Execute a trade based on signal
 */
export async function executeTrade(
  side: "BUY" | "SELL",
  symbol?: string,
): Promise<TradeResult> {
  const config = getConfig();
  const client = getBinanceFuturesClient();
  const orderService = getOrderService();

  const tradeSymbol = symbol || config.symbol;

  try {
    // Check for existing open position
    if (orderService.hasOpenPosition(tradeSymbol)) {
      return {
        success: false,
        error: "Already has open position",
      };
    }

    // Get account info for position sizing
    const account = await client.getAccountInfo();
    const availableBalance = parseFloat(account.availableBalance);
    console.log(`   💰 Balance disponible: $${availableBalance}`);
    const currentPrice = await client.getCurrentPrice(tradeSymbol);

    // Calculate position size
    const quantity = calculatePositionSize(
      availableBalance,
      config.riskPercent,
      currentPrice,
      config.stopLossPercent,
      config.leverage,
      config.maxPerPosition,
    );

    // Validate minimum notional (Binance requires at least 100 USDT)
    const BINANCE_MIN_NOTIONAL = 100;
    let finalQuantity = quantity;
    const notional = quantity * currentPrice;

    // Floor to 3 decimal places (Binance minimum is 0.001 BTC)
    let flooredQuantity = Math.floor(quantity * 1000) / 1000;
    const flooredNotional = flooredQuantity * currentPrice;

    if (flooredNotional >= BINANCE_MIN_NOTIONAL) {
      // Floor is OK - use it
      finalQuantity = flooredQuantity;
    } else if (notional >= BINANCE_MIN_NOTIONAL) {
      // Can't floor - would go below minimum. Use ceil to meet minimum
      finalQuantity = Math.ceil(quantity * 1000) / 1000;
      console.log(`   ⚠️ Ajustando a mínimo con ceil: ${finalQuantity} BTC = $${(finalQuantity * currentPrice).toFixed(2)} USDT`);
    } else {
      // Even original is below minimum
      const effectiveMax = getEffectiveMaxPerPosition(config.maxPerPosition);
      if (effectiveMax >= BINANCE_MIN_NOTIONAL || config.maxPerPosition === 0) {
        finalQuantity = Math.ceil((BINANCE_MIN_NOTIONAL / currentPrice) * 1000) / 1000;
        console.log(`   ⚠️ Ajustando a mínimo Binance: ${finalQuantity} BTC`);
      } else {
        console.log({ quantity, notional });
        return {
          success: false,
          error: `Insufficient notional: ${notional.toFixed(2)} USDT (min: ${BINANCE_MIN_NOTIONAL})`,
        };
      }
    }

    if (finalQuantity < 0.001) {
      console.log({ quantity: finalQuantity });
      return {
        success: false,
        error: "Insufficient balance for minimum position size",
      };
    }

    // Log max per position limit if set
    if (config.maxPerPosition > 0) {
      console.log(`   🔒 Límite máximo por posición: $${config.maxPerPosition} USDT`);
    }

    // Calculate SL/TP
    const { stopLoss, takeProfit } = calculateStopLossTakeProfit(
      currentPrice,
      side,
      config.stopLossPercent,
      config.takeProfitPercent,
    );

    // Open order with SL/TP
    const order = await orderService.openOrder(
      tradeSymbol,
      side,
      finalQuantity,
      currentPrice,
      stopLoss,
      takeProfit,
      config.leverage,
    );

    console.log(`[TRADE] Opened ${side} position:`, {
      symbol: tradeSymbol,
      quantity: finalQuantity,
      entryPrice: currentPrice,
      stopLoss,
      takeProfit,
      leverage: config.leverage,
    });

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error(`[TRADE ERROR] Failed to execute trade:`, error.message);
    if (error.response?.data) {
      console.error(
        `[TRADE ERROR] Details:`,
        JSON.stringify(error.response.data),
      );
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Close an existing position
 */
export async function closePosition(orderId?: string): Promise<TradeResult> {
  const orderService = getOrderService();

  try {
    // If no orderId provided, close first open position
    if (!orderId) {
      const openOrders = orderService.getOpenOrders();
      if (openOrders.length === 0) {
        return {
          success: false,
          error: "No open positions to close",
        };
      }
      orderId = openOrders[0].id;
    }

    const order = await orderService.closeOrder(orderId, "MANUAL");

    if (!order) {
      return {
        success: false,
        error: "Order not found or already closed",
      };
    }

    console.log(`[TRADE] Closed position:`, {
      orderId: order.id,
      pnl: order.pnl,
    });

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error(`[TRADE ERROR] Failed to close position:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get current position status
 */
export function getPositionStatus() {
  const orderService = getOrderService();
  const openOrders = orderService.getOpenOrders();

  return {
    hasOpenPosition: openOrders.length > 0,
    openPositions: openOrders,
    totalOpen: openOrders.length,
  };
}
