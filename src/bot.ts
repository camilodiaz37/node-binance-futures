import {
  getKlines,
  getTickerPrice,
  getAccountInfo,
  setLeverage,
  setMarginType,
  placeOrder,
  getPositions,
  type PlaceOrderParams,
} from "./trading";

// ============================================
// CONFIGURACIÓN DEL BOT
// ============================================
const CONFIG = {
  symbol: "BTCUSDT",
  interval: "1m",
  leverage: 10,
  marginType: "ISOLATED" as const,

  // Bollinger Bands
  bbPeriod: 20,
  bbStdDev: 2,

  // Control de trading
  minDistance: 0.5, // % mínimo entre señales
  checkInterval: 10000, // 10 segundos
  maxPositionSize: 0.01, // Tamaño máximo de posición

  // Rastreo de última operación
  lastSignal: null as "BUY" | "SELL" | null,
  lastSignalPrice: 0,
};

// ============================================
// INDICADORES TÉCNICOS
// ============================================

/**
 * Calcular Bollinger Bands
 */
function calculateBollingerBands(
  prices: number[],
  period: number,
  stdDev: number
): { upper: number; middle: number; lower: number } | null {
  if (prices.length < period) return null;

  const recentPrices = prices.slice(-period);

  // Media móvil simple (SMA)
  const sum = recentPrices.reduce((a, b) => a + b, 0);
  const middle = sum / period;

  // Desviación estándar
  const variance =
    recentPrices.reduce((acc, price) => acc + Math.pow(price - middle, 2), 0) /
    period;
  const std = Math.sqrt(variance);

  return {
    upper: middle + stdDev * std,
    middle,
    lower: middle - stdDev * std,
  };
}

/**
 * Calcular RSI
 */
function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
}

// ============================================
// LÓGICA DEL BOT
// ============================================

/**
 * Analizar mercado y generar señales
 */
async function analyzeMarket(): Promise<"BUY" | "SELL" | "HOLD"> {
  try {
    // Obtener klines
    const klines = await getKlines(CONFIG.symbol, CONFIG.interval, 100);
    const closes = klines.map((k) => parseFloat(k.close));

    // Calcular Bollinger Bands
    const bb = calculateBollingerBands(
      closes,
      CONFIG.bbPeriod,
      CONFIG.bbStdDev
    );

    if (!bb) return "HOLD";

    const currentPrice = closes[closes.length - 1];

    // Calcular RSI
    const rsi = calculateRSI(closes);

    console.log(`\n=== ANÁLISIS ${CONFIG.symbol} ===`);
    console.log(`Precio: $${currentPrice.toFixed(2)}`);
    console.log(`BB Upper: $${bb.upper.toFixed(2)}`);
    console.log(`BB Middle: $${bb.middle.toFixed(2)}`);
    console.log(`BB Lower: $${bb.lower.toFixed(2)}`);
    if (rsi) console.log(`RSI: ${rsi.toFixed(2)}`);

    // SEÑAL DE COMPRA: Precio toca o rompe bajo la banda inferior
    const priceNearLower = currentPrice <= bb.lower * 1.01;
    const priceBelowLower = currentPrice < bb.lower;

    // SEÑAL DE VENTA: Precio toca o rompe sobre la banda superior
    const priceNearUpper = currentPrice >= bb.upper * 0.99;
    const priceAboveUpper = currentPrice > bb.upper;

    // Verificar distancia mínima desde última señal
    const priceChanged =
      Math.abs(currentPrice - CONFIG.lastSignalPrice) /
      CONFIG.lastSignalPrice >
      CONFIG.minDistance / 100;

    // Señal de compra
    if (
      (priceNearLower || priceBelowLower) &&
      (!rsi || rsi < 35) &&
      (CONFIG.lastSignal !== "BUY" || priceChanged)
    ) {
      console.log("🔵 SEÑAL: BUY (precio en/bajo banda inferior)");
      return "BUY";
    }

    // Señal de venta
    if (
      (priceNearUpper || priceAboveUpper) &&
      (!rsi || rsi > 65) &&
      (CONFIG.lastSignal !== "SELL" || priceChanged)
    ) {
      console.log("🔴 SEÑAL: SELL (precio en/sobre banda superior)");
      return "SELL";
    }

    console.log("⏸️ SEÑAL: HOLD");
    return "HOLD";
  } catch (error) {
    console.error("Error al analizar mercado:", error);
    return "HOLD";
  }
}

/**
 * Obtener tamaño de posición basado en balance
 */
async function getPositionSize(): Promise<number> {
  try {
    const accountInfo = await getAccountInfo();
    const balance = parseFloat(accountInfo.totalWalletBalance);

    // Usar 10% del balance por operación
    const positionValue = balance * 0.1 * CONFIG.leverage;

    // Obtener precio actual
    const ticker = await getTickerPrice(CONFIG.symbol);
    const price = parseFloat(ticker.price);

    const quantity = positionValue / price;

    // Ajustar a límites permitidos
    const adjustedQty = Math.min(quantity, CONFIG.maxPositionSize);
    const finalQty = Math.max(adjustedQty, 0.001);

    console.log(`Balance: $${balance.toFixed(2)}`);
    console.log(`Tamaño de posición: ${finalQty.toFixed(6)} ${CONFIG.symbol}`);

    return finalQty;
  } catch (error) {
    console.error("Error al calcular tamaño de posición:", error);
    return 0.001;
  }
}

/**
 * Ejecutar orden
 */
async function executeTrade(side: "BUY" | "SELL"): Promise<boolean> {
  try {
    // Configurar apalancamiento
    console.log(`Configurando apalancamiento ${CONFIG.leverage}x...`);
    await setLeverage(CONFIG.symbol, CONFIG.leverage);

    // Configurar tipo de margen
    console.log(`Configurando margen ${CONFIG.marginType}...`);
    await setMarginType(CONFIG.symbol, CONFIG.marginType);

    // Obtener tamaño de posición
    const quantity = await getPositionSize();

    // Verificar posiciones existentes
    const positions = await getPositions(CONFIG.symbol);
    const hasPosition = positions.some(
      (p) => Math.abs(parseFloat(p.positionAmt)) > 0
    );

    // Si ya hay posición en la misma dirección, no operar
    if (hasPosition) {
      console.log("⚠️ Ya existe una posición abierta");
      return false;
    }

    // Determinar positionSide
    const positionSide = side === "BUY" ? "LONG" : "SHORT";

    // Crear orden
    const orderParams: PlaceOrderParams = {
      symbol: CONFIG.symbol,
      side,
      type: "MARKET",
      quantity,
      positionSide: positionSide as "LONG" | "SHORT",
    };

    console.log(`Ejecutando orden ${side}...`);
    const order = await placeOrder(orderParams);

    console.log(`\n✅ ORDEN EJECUTADA:`);
    console.log(`   Tipo: ${side} ${positionSide}`);
    console.log(`   Cantidad: ${order.origQty}`);
    console.log(`   Precio: ${order.avgPrice}`);

    // Actualizar estado
    const ticker = await getTickerPrice(CONFIG.symbol);
    CONFIG.lastSignal = side;
    CONFIG.lastSignalPrice = parseFloat(ticker.price);

    return true;
  } catch (error) {
    console.error("❌ Error al ejecutar orden:", error);
    return false;
  }
}

/**
 * Ciclo principal del bot
 */
let isRunning = false;

export async function startBot(): Promise<void> {
  if (isRunning) {
    console.log("⚠️ El bot ya está corriendo");
    return;
  }

  isRunning = true;
  console.log("\n🚀 BOT DE SCALPING INICIADO");
  console.log(`   Símbolo: ${CONFIG.symbol}`);
  console.log(`   Timeframe: ${CONFIG.interval}`);
  console.log(`   Apalancamiento: ${CONFIG.leverage}x`);
  console.log(`   Estrategia: Bollinger Bands (${CONFIG.bbPeriod}, ${CONFIG.bbStdDev})`);
  console.log(`   Intervalo: ${CONFIG.checkInterval / 1000}s\n`);

  // Ciclo principal
  const loop = async () => {
    if (!isRunning) return;

    try {
      // Analizar mercado
      const signal = await analyzeMarket();

      // Ejecutar si hay señal
      if (signal !== "HOLD") {
        await executeTrade(signal);
      }
    } catch (error) {
      console.error("Error en el ciclo del bot:", error);
    }

    // Programar siguiente ciclo
    setTimeout(loop, CONFIG.checkInterval);
  };

  // Iniciar ciclo
  loop();
}

export function stopBot(): void {
  isRunning = false;
  console.log("\n🛑 Bot detenido");
}

export function getBotStatus(): { running: boolean; config: typeof CONFIG } {
  return { running: isRunning, config: CONFIG };
}