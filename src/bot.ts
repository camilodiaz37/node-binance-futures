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
  minTimeBetweenTrades: 60000, // 1 minuto entre trades
  checkInterval: 10000, // 10 segundos
  maxPositionSize: 0.01, // Tamaño máximo de posición

  // Gestión de riesgo
  stopLossPercent: 0.5, // 0.5% del precio = 5% con 10x leverage
  takeProfitPercent: 1.0, // 1.0% del precio = 10% con 10x leverage
  useTrailingStop: true,
  trailingStopPercent: 0.3, // Activa trailing cuando alcanza TP%

  // Rastreo de última operación
  lastSignal: null as "BUY" | "SELL" | null,
  lastSignalPrice: 0,
  lastTradeTime: 0,
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
  stdDev: number,
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
      CONFIG.bbStdDev,
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
      Math.abs(currentPrice - CONFIG.lastSignalPrice) / CONFIG.lastSignalPrice >
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

// ============================================
// GESTIÓN DE POSICIONES
// ============================================

interface OpenPosition {
  side: "BUY" | "SELL";
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  openTime: number;
  trailingActivated: boolean;
}

let openPosition: OpenPosition | null = null;

/**
 * Calcular niveles de SL y TP
 */
function calculateStopLossAndTakeProfit(
  entryPrice: number,
  side: "BUY" | "SELL",
  stopLossPercent: number,
  takeProfitPercent: number,
): { stopLoss: number; takeProfit: number } {
  if (side === "BUY") {
    return {
      stopLoss: entryPrice * (1 - stopLossPercent / 100),
      takeProfit: entryPrice * (1 + takeProfitPercent / 100),
    };
  } else {
    return {
      stopLoss: entryPrice * (1 + stopLossPercent / 100),
      takeProfit: entryPrice * (1 - takeProfitPercent / 100),
    };
  }
}

/**
 * Verificar y cerrar posiciones por SL/TP
 */
async function checkStopLossTakeProfit(): Promise<boolean> {
  if (!openPosition) return false;

  try {
    const ticker = await getTickerPrice(CONFIG.symbol);
    const currentPrice = parseFloat(ticker.price);

    let shouldClose = false;
    let closeReason: "SL" | "TP" | "TRAILING" | null = null;

    if (openPosition.side === "BUY") {
      console.log(
        `   Verificando SL/TP para LONG: $${currentPrice.toFixed(2)} (SL: $${openPosition.stopLoss.toFixed(
          2,
        )}, TP: $${openPosition.takeProfit.toFixed(2)})`,
      );
      // LONG: SL si baja, TP si sube
      if (currentPrice <= openPosition.stopLoss) {
        shouldClose = true;
        closeReason = "SL";
      } else if (currentPrice >= openPosition.takeProfit) {
        // Activar trailing stop
        if (CONFIG.useTrailingStop && !openPosition.trailingActivated) {
          openPosition.trailingActivated = true;
          openPosition.stopLoss = openPosition.entryPrice; // Break even
          console.log("   📈 Trailing stop activado (break even)");
        }
        if (
          CONFIG.useTrailingStop &&
          openPosition.trailingActivated &&
          currentPrice <
            openPosition.stopLoss +
              (CONFIG.trailingStopPercent * openPosition.entryPrice) / 100
        ) {
          shouldClose = true;
          closeReason = "TRAILING";
        } else if (!CONFIG.useTrailingStop) {
          shouldClose = true;
          closeReason = "TP";
        }
      }
    } else {
      // SHORT: SL si sube, TP si baja
      if (currentPrice >= openPosition.stopLoss) {
        shouldClose = true;
        closeReason = "SL";
      } else if (currentPrice <= openPosition.takeProfit) {
        // Activar trailing stop
        if (CONFIG.useTrailingStop && !openPosition.trailingActivated) {
          openPosition.trailingActivated = true;
          openPosition.stopLoss = openPosition.entryPrice; // Break even
          console.log("   📉 Trailing stop activado (break even)");
        }
        if (
          CONFIG.useTrailingStop &&
          openPosition.trailingActivated &&
          currentPrice >
            openPosition.stopLoss -
              (CONFIG.trailingStopPercent * openPosition.entryPrice) / 100
        ) {
          shouldClose = true;
          closeReason = "TRAILING";
        } else if (!CONFIG.useTrailingStop) {
          shouldClose = true;
          closeReason = "TP";
        }
      }
    }

    if (shouldClose) {
      const closeSide = openPosition.side === "BUY" ? "SELL" : "BUY";
      console.log(
        `⚠️ Cerrando posición por ${closeReason}: $${currentPrice.toFixed(2)}`,
      );

      const orderParams: PlaceOrderParams = {
        symbol: CONFIG.symbol,
        side: closeSide,
        type: "MARKET",
        quantity: openPosition.quantity,
      };

      await placeOrder(orderParams);

      const pnl =
        openPosition.side === "BUY"
          ? (currentPrice - openPosition.entryPrice) *
            openPosition.quantity *
            CONFIG.leverage
          : (openPosition.entryPrice - currentPrice) *
            openPosition.quantity *
            CONFIG.leverage;

      console.log(`\n🛑 POSICIÓN CERRADA (${closeReason}):`);
      console.log(`   Entrada: $${openPosition.entryPrice.toFixed(2)}`);
      console.log(`   Salida: $${currentPrice.toFixed(2)}`);
      console.log(`   P/L: $${pnl.toFixed(2)}`);

      openPosition = null;
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error al verificar SL/TP:", error);
    return false;
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
    // Configurar apalancamiento (ignorar si ya está configurado)
    console.log(`Configurando apalancamiento ${CONFIG.leverage}x...`);
    try {
      await setLeverage(CONFIG.symbol, CONFIG.leverage);
    } catch (error) {
      // Ignorar error si ya está configurado el mismo apalancamiento
      if (
        error instanceof Error &&
        (error.message.includes("same") || error.message.includes("No need"))
      ) {
        console.log("   ℹ️ Apalancamiento ya configurado");
      } else {
        throw error;
      }
    }

    // Configurar tipo de margen (ignorar si ya está configurado)
    console.log(`Configurando margen ${CONFIG.marginType}...`);
    try {
      await setMarginType(CONFIG.symbol, CONFIG.marginType);
    } catch (error) {
      // Ignorar error -4046 (ya está configurado)
      if (error instanceof Error && error.message.includes('"code":-4046')) {
        console.log("   ℹ️ Margen ya configurado");
      } else {
        throw error;
      }
    }

    // Obtener tamaño de posición
    const quantity = await getPositionSize();

    // Verificar posiciones existentes
    const positions = await getPositions(CONFIG.symbol);
    const hasPosition = positions.some(
      (p) => Math.abs(parseFloat(p.positionAmt)) > 0,
    );

    // Si ya hay posición en la misma dirección, no operar
    if (hasPosition) {
      console.log("⚠️ Ya existe una posición abierta");
      return false;
    }

    // Determinar positionSide
    const positionSide = side === "BUY" ? "LONG" : "SHORT";

    // Crear orden (sin positionSide para evitar conflictos)
    const orderParams: PlaceOrderParams = {
      symbol: CONFIG.symbol,
      side,
      type: "MARKET",
      quantity,
    };

    console.log(`Ejecutando orden ${side}...`);
    let order;
    try {
      order = await placeOrder(orderParams);
    } catch (error) {
      // Si falla, intentar con positionSide
      if (error instanceof Error && error.message.includes("-4061")) {
        console.log("   ℹ️ Reintentando con positionSide...");
        orderParams.positionSide = positionSide as "LONG" | "SHORT";
        order = await placeOrder(orderParams);
      } else {
        throw error;
      }
    }

    console.log(`\n✅ ORDEN EJECUTADA:`);
    console.log(`   Tipo: ${side} ${positionSide}`);
    console.log(`   Cantidad: ${order.origQty}`);
    console.log(`   Precio: ${order.avgPrice}`);

    // Calcular y mostrar SL/TP
    const entryPrice = parseFloat(order.avgPrice);
    const { stopLoss, takeProfit } = calculateStopLossAndTakeProfit(
      entryPrice,
      side,
      CONFIG.stopLossPercent,
      CONFIG.takeProfitPercent,
    );

    console.log(
      `   📉 SL: $${stopLoss.toFixed(2)} (-${CONFIG.stopLossPercent}%)`,
    );
    console.log(
      `   📈 TP: $${takeProfit.toFixed(2)} (+${CONFIG.takeProfitPercent}%)`,
    );

    // Guardar posición abierta
    openPosition = {
      side,
      entryPrice,
      quantity: parseFloat(order.origQty),
      stopLoss,
      takeProfit,
      openTime: Date.now(),
      trailingActivated: false,
    };

    // Actualizar estado
    const ticker = await getTickerPrice(CONFIG.symbol);
    CONFIG.lastSignal = side;
    CONFIG.lastSignalPrice = parseFloat(ticker.price);
    CONFIG.lastTradeTime = Date.now();

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
  console.log(
    `   Estrategia: Bollinger Bands (${CONFIG.bbPeriod}, ${CONFIG.bbStdDev})`,
  );
  console.log(`   Intervalo: ${CONFIG.checkInterval / 1000}s\n`);

  // Ciclo principal
  const loop = async () => {
    if (!isRunning) return;

    try {
      // Verificar SL/TP si hay posición abierta
      if (openPosition) {
        const closed = await checkStopLossTakeProfit();
        if (closed) {
          // Posición cerrada, continuar al siguiente ciclo
          setTimeout(loop, CONFIG.checkInterval);
          return;
        }
      }

      // Verificar cooldown
      const timeSinceLastTrade = Date.now() - CONFIG.lastTradeTime;
      if (timeSinceLastTrade < CONFIG.minTimeBetweenTrades) {
        const waitTime = CONFIG.minTimeBetweenTrades - timeSinceLastTrade;
        console.log(
          `   ⏳ Esperando cooldown (${Math.ceil(waitTime / 1000)}s)`,
        );
        setTimeout(loop, waitTime);
        return;
      }

      // Verificar posiciones existentes
      const positions = await getPositions(CONFIG.symbol);
      const existingPosition = positions.find(
        (p) => Math.abs(parseFloat(p.positionAmt)) > 0,
      );

      if (existingPosition && !openPosition) {
        // Sincronizar posición existente
        const positionAmt = parseFloat(existingPosition.positionAmt);
        const side = positionAmt > 0 ? "BUY" : "SELL";
        const entryPrice = parseFloat(existingPosition.entryPrice);

        const { stopLoss, takeProfit } = calculateStopLossAndTakeProfit(
          entryPrice,
          side,
          CONFIG.stopLossPercent,
          CONFIG.takeProfitPercent,
        );

        openPosition = {
          side,
          entryPrice,
          quantity: Math.abs(positionAmt),
          stopLoss,
          takeProfit,
          openTime: existingPosition.updateTime,
          trailingActivated: false,
        };

        console.log("   ℹ️ Posición sincronizada:");
        console.log(`      Tipo: ${side} | Entrada: $${entryPrice}`);
        console.log(`      SL: $${stopLoss} | TP: $${takeProfit}`);
      }

      if (!openPosition) {
        // Analizar mercado solo si no hay posición
        const signal = await analyzeMarket();

        // Ejecutar si hay señal y no hay posición
        if (signal !== "HOLD") {
          await executeTrade(signal);
        }
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
