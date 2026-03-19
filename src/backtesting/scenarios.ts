import { Kline } from "./types";

/**
 * Datos históricos simulados de BTCUSDT - Escenarios de prueba
 * Basados en movimientos reales del mercado
 */

export const scenarios: Record<string, Kline[]> = {
  /**
   * Escenario 1: Tendencia alcista con volatilidad
   * Precio sube de 42000 a 45000 con rebotes en BB inferiores
   */
  bullish_volatile: generateScenario([
    { price: 42000, change: 0.002 },
    { price: 42100, change: 0.003 },
    { price: 42250, change: 0.004 },
    { price: 42180, change: -0.002 },
    { price: 42050, change: -0.003 }, // Toca BB inferior - BUY signal
    { price: 42100, change: 0.002 },
    { price: 42300, change: 0.005 },
    { price: 42500, change: 0.005 },
    { price: 42650, change: 0.004 },
    { price: 42800, change: 0.004 },
    { price: 43000, change: 0.005 },
    { price: 43200, change: 0.005 },
    { price: 43400, change: 0.005 },
    { price: 43600, change: 0.005 },
    { price: 43800, change: 0.005 },
    { price: 44000, change: 0.005 },
    { price: 44200, change: 0.005 },
    { price: 44400, change: 0.005 },
    { price: 44600, change: 0.005 },
    { price: 44800, change: 0.005 },
    { price: 45000, change: 0.005 }, // Toca BB superior - SELL signal
  ]),

  /**
   * Escenario 2: Tendencia bajista con recuperación
   * Precio baja de 48000 a 44000 con rebotes en BB superiores
   */
  bearish_recovery: generateScenario([
    { price: 48000, change: -0.002 },
    { price: 47800, change: -0.004 },
    { price: 47600, change: -0.004 },
    { price: 47400, change: -0.004 },
    { price: 47200, change: -0.004 },
    { price: 47000, change: -0.004 },
    { price: 46800, change: -0.004 },
    { price: 46600, change: -0.004 },
    { price: 46400, change: -0.004 },
    { price: 46200, change: -0.004 },
    { price: 46000, change: -0.004 },
    { price: 45800, change: -0.004 },
    { price: 45600, change: -0.004 },
    { price: 45400, change: -0.004 },
    { price: 45200, change: -0.004 },
    { price: 45000, change: -0.004 },
    { price: 44800, change: -0.004 },
    { price: 44600, change: -0.004 },
    { price: 44400, change: -0.004 },
    { price: 44200, change: -0.004 },
    { price: 44000, change: -0.004 }, // Toca BB superior - SELL signal
  ]),

  /**
   * Escenario 3: Mercado lateral con varias señales
   * Precio oscila entre 43500 y 45500
   */
  sideways: generateScenario([
    { price: 43500, change: 0.003 },
    { price: 43600, change: 0.003 },
    { price: 43700, change: 0.003 },
    { price: 43800, change: 0.003 },
    { price: 43900, change: 0.003 },
    { price: 44000, change: 0.003 },
    { price: 44100, change: 0.003 },
    { price: 44200, change: 0.003 },
    { price: 44300, change: 0.003 },
    { price: 44400, change: 0.003 },
    { price: 44500, change: 0.003 },
    { price: 44600, change: 0.003 },
    { price: 44700, change: 0.003 },
    { price: 44800, change: 0.003 },
    { price: 44900, change: 0.003 },
    { price: 45000, change: 0.003 },
    { price: 45100, change: 0.003 },
    { price: 45200, change: 0.003 },
    { price: 45300, change: 0.003 },
    { price: 45400, change: 0.003 },
    { price: 45500, change: 0.003 },
    { price: 45400, change: -0.003 },
    { price: 45300, change: -0.003 },
    { price: 45200, change: -0.003 },
    { price: 45100, change: -0.003 },
    { price: 45000, change: -0.003 },
    { price: 44900, change: -0.003 },
    { price: 44800, change: -0.003 },
    { price: 44700, change: -0.003 },
    { price: 44600, change: -0.003 },
    { price: 44500, change: -0.003 },
    { price: 44400, change: -0.003 },
    { price: 44300, change: -0.003 },
    { price: 44200, change: -0.003 },
    { price: 44100, change: -0.003 },
    { price: 44000, change: -0.003 },
    { price: 43900, change: -0.003 },
    { price: 43800, change: -0.003 },
    { price: 43700, change: -0.003 },
    { price: 43600, change: -0.003 },
    { price: 43500, change: -0.003 },
  ]),

  /**
   * Escenario 4: Flash crash
   * Caída rápida y recuperación
   */
  flash_crash: generateScenario([
    { price: 50000, change: -0.001 },
    { price: 49800, change: -0.004 },
    { price: 49400, change: -0.008 },
    { price: 48800, change: -0.012 }, // Fuerte caida
    { price: 48000, change: -0.016 },
    { price: 47000, change: -0.021 }, // Bottom - BUY signal
    { price: 47500, change: 0.011 },
    { price: 48000, change: 0.011 },
    { price: 48500, change: 0.010 },
    { price: 49000, change: 0.010 },
    { price: 49500, change: 0.010 },
    { price: 50000, change: 0.010 },
  ]),

  /**
   * Escenario 5: Rally parabólico
   * Subida continua sin retrocesos
   */
  parabolic_rally: generateScenario([
    { price: 40000, change: 0.005 },
    { price: 40500, change: 0.006 },
    { price: 41000, change: 0.006 },
    { price: 41500, change: 0.006 },
    { price: 42000, change: 0.006 },
    { price: 42500, change: 0.006 },
    { price: 43000, change: 0.006 },
    { price: 43500, change: 0.006 },
    { price: 44000, change: 0.006 },
    { price: 44500, change: 0.006 },
    { price: 45000, change: 0.006 },
    { price: 45500, change: 0.006 },
    { price: 46000, change: 0.006 },
    { price: 46500, change: 0.006 },
    { price: 47000, change: 0.006 },
  ]),
};

/**
 * Genera un escenario a partir de movimientos de precio
 */
function generateScenario(
  movements: { price: number; change: number }[]
): Kline[] {
  const klines: Kline[] = [];
  let baseTime = Date.now() - movements.length * 60000;

  for (const movement of movements) {
    const open = movement.price.toString();
    const change = movement.price * movement.change;
    const high = (movement.price + Math.abs(change) * 1.5).toString();
    const low = (movement.price - Math.abs(change) * 1.5).toString();
    const close = (movement.price + change).toString();
    const volume = (Math.random() * 1000 + 500).toString();

    klines.push({
      openTime: baseTime,
      open,
      high,
      low,
      close,
      volume,
      closeTime: baseTime + 60000,
    });

    baseTime += 60000;
  }

  return klines;
}

export function getScenario(name: string): Kline[] | undefined {
  return scenarios[name];
}

export function getAllScenarios(): string[] {
  return Object.keys(scenarios);
}