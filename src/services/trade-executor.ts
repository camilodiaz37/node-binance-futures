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
 */
export function calculatePositionSize(
  availableBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPercent: number,
  leverage: number = 1,
): number {
  // Calculate position value based on risk amount (not leverage)
  const riskAmount = availableBalance * (riskPercent / 100);
  const priceRiskPerUnit = entryPrice * (stopLossPercent / 100);
  const quantity = riskAmount / priceRiskPerUnit;

  // Calculate max position based on available balance (without leverage for safety check)
  const maxPositionFromBalance = availableBalance / entryPrice;

  // Use the smaller of calculated quantity or available balance
  // This ensures we never trade more than we have in the wallet
  const safeQuantity = Math.min(quantity, maxPositionFromBalance);

  // Round to 3 decimal places (Binance minimum is 0.001)
  return Math.floor(safeQuantity * 1000) / 1000;
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
    );

    if (quantity < 0.001) {
      console.log({ quantity });
      return {
        success: false,
        error: "Insufficient balance for minimum position size",
      };
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
      quantity,
      currentPrice,
      stopLoss,
      takeProfit,
      config.leverage,
    );

    console.log(`[TRADE] Opened ${side} position:`, {
      symbol: tradeSymbol,
      quantity,
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
