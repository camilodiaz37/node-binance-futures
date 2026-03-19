import { getConfig } from "./config";
import { getStrategy } from "./strategies/base-strategy";
import { getBinanceFuturesClient } from "./services/binance-futures";
import { getOrderService } from "./services/order-service";
import { executeTrade, getPositionStatus, closePosition } from "./services/trade-executor";
import { analyzeMarket, shouldOpenPosition } from "./strategies/signal-generator";

let isRunning = false;
let botInterval: NodeJS.Timeout | null = null;

/**
 * Main trading cycle - runs every 15 minutes
 */
async function tradingCycle(): Promise<void> {
  const config = getConfig();

  try {
    console.log(`\n=== CICLO DE TRADING ${new Date().toISOString()} ===`);

    // Check for open positions
    const status = getPositionStatus();

    if (status.hasOpenPosition) {
      console.log(`📊 Posición abierta: ${status.totalOpen}`);

      // Check and close positions on SL/TP
      const client = getBinanceFuturesClient();
      const orderService = getOrderService();
      const currentPrice = await client.getCurrentPrice(config.symbol);

      for (const order of status.openPositions) {
        const result = await orderService.checkStopLossTakeProfit(order.id, currentPrice);

        if (result !== "NONE") {
          console.log(`⚠️ Posición cerrada por ${result}: $${currentPrice.toFixed(2)}`);
        }
      }

      console.log("   Esperando próximo ciclo...");
      return;
    }

    // No open position - analyze market
    const analysis = await analyzeMarket(config.symbol);
    console.log(`📈 Señal: ${analysis.signal.type}`);
    console.log(`   Precio: $${analysis.currentPrice.toFixed(2)}`);
    console.log(`   RSI: ${analysis.indicators.rsi.toFixed(2)}`);
    console.log(`   MACD: ${analysis.indicators.macd.toFixed(4)}`);
    console.log(`   SMA: ${analysis.indicators.sma.toFixed(2)}`);
    console.log(`   Razón: ${analysis.signal.reason}`);

    // Execute trade if signal is BUY or SELL
    if (analysis.signal.type !== "HOLD") {
      const side = analysis.signal.type === "BUY" ? "BUY" : "SELL";
      const result = await executeTrade(side, config.symbol);

      if (result.success) {
        console.log(`✅ Trade ejecutado: ${side}`);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    } else {
      console.log("⏸️ Sin señal clara, manteniendo espera");
    }
  } catch (error: any) {
    console.error("❌ Error en ciclo de trading:", error.message);
  }
}

/**
 * Start the trading bot
 */
export async function startBot(): Promise<void> {
  if (isRunning) {
    console.log("⚠️ El bot ya está corriendo");
    return;
  }

  const config = getConfig();
  const client = getBinanceFuturesClient();
  isRunning = true;

  console.log("\n🚀 BOT DE TRADING INICIADO");
  console.log(`   Símbolo: ${config.symbol}`);
  console.log(`   Apalancamiento: ${config.leverage}x`);
  console.log(`   Riesgo por trade: ${config.riskPercent}%`);
  console.log(`   SL: ${config.stopLossPercent}% | TP: ${config.takeProfitPercent}%`);
  console.log(`   Intervalo: ${config.executionInterval} minutos\n`);

  // Configure One-way Mode (required for the bot to work correctly)
  console.log("   Configurando One-way Mode...");
  try {
    await client.enableOneWayMode();
  } catch (error) {
    console.log("   ℹ️ Posición Mode ya configurado o no disponible");
  }

  // Run immediately
  await tradingCycle();

  // Schedule recurring execution
  const intervalMs = config.executionInterval * 60 * 1000;
  botInterval = setInterval(tradingCycle, intervalMs);

  console.log(`📅 Bot programado cada ${config.executionInterval} minutos`);
}

/**
 * Stop the trading bot
 */
export function stopBot(): void {
  if (botInterval) {
    clearInterval(botInterval);
    botInterval = null;
  }
  isRunning = false;
  console.log("\n🛑 Bot detenido");
}

/**
 * Get current bot status
 */
export function getBotStatus(): {
  running: boolean;
  hasPosition: boolean;
  config: ReturnType<typeof getConfig>;
} {
  const status = getPositionStatus();
  const config = getConfig();

  return {
    running: isRunning,
    hasPosition: status.hasOpenPosition,
    config,
  };
}

/**
 * Run a single trading cycle (for manual triggering)
 */
export async function runOnce(): Promise<void> {
  await tradingCycle();
}

// Export for testing
export { tradingCycle };