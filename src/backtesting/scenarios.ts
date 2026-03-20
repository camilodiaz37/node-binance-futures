import { Kline } from "./types";

/**
 * Datos históricos simulados de BTCUSDT - 40 Escenarios de prueba
 * Basados en movimientos reales del mercado
 * Categorizados por condición de mercado
 */

export const scenarios: Record<string, Kline[]> = {
  // ============================================================
  // TRENDING UP (10 scenarios)
  // ============================================================

  /**
   * Escenario 1: Tendencia alcista con volatilidad
   */
  bullish_volatile: generateScenario([
    { price: 42000, change: 0.002 },
    { price: 42100, change: 0.003 },
    { price: 42250, change: 0.004 },
    { price: 42180, change: -0.002 },
    { price: 42050, change: -0.003 },
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
    { price: 45000, change: 0.009 },
  ]),

  /**
   * Escenario 2: Fuerte tendencia alcista
   */
  strong_uptrend: generateScenario([
    { price: 40000, change: 0.004 },
    { price: 40200, change: 0.005 },
    { price: 40400, change: 0.005 },
    { price: 40600, change: 0.005 },
    { price: 40800, change: 0.005 },
    { price: 41000, change: 0.005 },
    { price: 41200, change: 0.005 },
    { price: 41400, change: 0.005 },
    { price: 41600, change: 0.005 },
    { price: 41800, change: 0.005 },
    { price: 42000, change: 0.005 },
    { price: 42200, change: 0.005 },
    { price: 42400, change: 0.005 },
    { price: 42600, change: 0.005 },
    { price: 42800, change: 0.005 },
    { price: 43000, change: 0.005 },
    { price: 43200, change: 0.005 },
    { price: 43500, change: 0.007 },
  ]),

  /**
   * Escenario 3: Rally gradual con retrocesos
   */
  gradual_rally: generateScenario([
    { price: 43000, change: 0.002 },
    { price: 43100, change: 0.002 },
    { price: 43200, change: 0.002 },
    { price: 43100, change: -0.002 },
    { price: 43000, change: -0.002 },
    { price: 43100, change: 0.002 },
    { price: 43300, change: 0.005 },
    { price: 43500, change: 0.005 },
    { price: 43600, change: 0.002 },
    { price: 43500, change: -0.002 },
    { price: 43600, change: 0.002 },
    { price: 43800, change: 0.005 },
    { price: 44000, change: 0.005 },
    { price: 44100, change: 0.002 },
    { price: 44200, change: 0.002 },
    { price: 44400, change: 0.005 },
    { price: 44600, change: 0.005 },
    { price: 44800, change: 0.005 },
    { price: 45000, change: 0.005 },
  ]),

  /**
   * Escenario 4: Rompmiento de resistencia
   */
  break_out: generateScenario([
    { price: 44500, change: 0.001 },
    { price: 44550, change: 0.001 },
    { price: 44600, change: 0.001 },
    { price: 44550, change: -0.001 },
    { price: 44500, change: -0.001 },
    { price: 44600, change: 0.002 },
    { price: 44700, change: 0.002 },
    { price: 44800, change: 0.002 },
    { price: 44900, change: 0.002 },
    { price: 45000, change: 0.002 },
    { price: 45200, change: 0.004 }, // Breakout
    { price: 45500, change: 0.007 },
    { price: 45800, change: 0.007 },
    { price: 46100, change: 0.007 },
    { price: 46400, change: 0.007 },
    { price: 46700, change: 0.007 },
    { price: 47000, change: 0.006 },
  ]),

  /**
   * Escenario 5: Impulso con gaps alcistas
   */
  momentum_gap: generateScenario([
    { price: 41000, change: 0.003 },
    { price: 41200, change: 0.005 },
    { price: 41400, change: 0.005 },
    { price: 41500, change: 0.002 },
    { price: 41700, change: 0.005 },
    { price: 41900, change: 0.005 },
    { price: 42000, change: 0.002 },
    { price: 42300, change: 0.007 }, // Gap up
    { price: 42600, change: 0.007 },
    { price: 42800, change: 0.005 },
    { price: 43000, change: 0.005 },
    { price: 43200, change: 0.005 },
    { price: 43500, change: 0.007 },
    { price: 43800, change: 0.007 },
  ]),

  /**
   * Escenario 6: Doble suelo rebote
   */
  double_bottom_bounce: generateScenario([
    { price: 42000, change: -0.004 },
    { price: 41800, change: -0.005 },
    { price: 41500, change: -0.007 },
    { price: 41200, change: -0.007 },
    { price: 41000, change: -0.005 },
    { price: 41200, change: 0.005 },
    { price: 41400, change: 0.005 },
    { price: 41500, change: 0.002 },
    { price: 41300, change: -0.005 },
    { price: 41000, change: -0.007 },
    { price: 40800, change: -0.005 }, // Second bottom
    { price: 41000, change: 0.005 },
    { price: 41300, change: 0.007 },
    { price: 41600, change: 0.007 },
    { price: 42000, change: 0.010 },
    { price: 42500, change: 0.012 },
  ]),

  /**
   * Escenario 7: Triángulo ascendente
   */
  ascending_triangle: generateScenario([
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.002 },
    { price: 44150, change: 0.001 },
    { price: 44200, change: 0.001 },
    { price: 44200, change: 0.000 },
    { price: 44300, change: 0.002 },
    { price: 44350, change: 0.001 },
    { price: 44400, change: 0.001 },
    { price: 44400, change: 0.000 },
    { price: 44500, change: 0.002 },
    { price: 44550, change: 0.001 },
    { price: 44600, change: 0.001 },
    { price: 44700, change: 0.002 },
    { price: 44900, change: 0.004 }, // Breakout
    { price: 45200, change: 0.007 },
    { price: 45500, change: 0.007 },
  ]),

  /**
   * Escenario 8: Reversión alcista desde soporte
   */
  bullish_reversal: generateScenario([
    { price: 40000, change: -0.005 },
    { price: 39600, change: -0.010 },
    { price: 39200, change: -0.010 },
    { price: 39000, change: -0.005 },
    { price: 38800, change: -0.005 }, // Soporte
    { price: 39000, change: 0.005 },
    { price: 39300, change: 0.008 },
    { price: 39600, change: 0.008 },
    { price: 40000, change: 0.010 },
    { price: 40400, change: 0.010 },
    { price: 40800, change: 0.010 },
    { price: 41200, change: 0.010 },
    { price: 41600, change: 0.010 },
  ]),

  /**
   * Escenario 9: Soporte en línea de tendencia
   */
  trendline_support: generateScenario([
    { price: 43000, change: 0.003 },
    { price: 43200, change: 0.005 },
    { price: 43400, change: 0.005 },
    { price: 43500, change: 0.002 },
    { price: 43400, change: -0.002 },
    { price: 43300, change: -0.002 },
    { price: 43200, change: -0.002 },
    { price: 43100, change: -0.002 },
    { price: 43000, change: -0.002 }, // Trendline support
    { price: 43100, change: 0.002 },
    { price: 43300, change: 0.005 },
    { price: 43500, change: 0.005 },
    { price: 43700, change: 0.005 },
    { price: 43900, change: 0.005 },
    { price: 44100, change: 0.005 },
    { price: 44300, change: 0.005 },
  ]),

  /**
   * Escenario 10: Aumento de volumen alcistas
   */
  volume_surge: generateScenario([
    { price: 42000, change: 0.002 },
    { price: 42100, change: 0.002 },
    { price: 42200, change: 0.002 },
    { price: 42200, change: 0.000 },
    { price: 42100, change: -0.002 },
    { price: 42000, change: -0.002 },
    { price: 42100, change: 0.002 },
    { price: 42300, change: 0.005 },
    { price: 42500, change: 0.005 },
    { price: 42700, change: 0.005 },
    { price: 43000, change: 0.007 }, // Volume surge
    { price: 43400, change: 0.009 },
    { price: 43800, change: 0.009 },
    { price: 44200, change: 0.009 },
  ]),

  // ============================================================
  // TRENDING DOWN (10 scenarios)
  // ============================================================

  /**
   * Escenario 11: Tendencia bajista con volatilidad
   */
  bearish_volatile: generateScenario([
    { price: 48000, change: -0.002 },
    { price: 47900, change: -0.003 },
    { price: 47750, change: -0.004 },
    { price: 47820, change: 0.002 },
    { price: 47950, change: 0.003 },
    { price: 47900, change: -0.002 },
    { price: 47700, change: -0.005 },
    { price: 47500, change: -0.005 },
    { price: 47350, change: -0.004 },
    { price: 47200, change: -0.004 },
    { price: 47000, change: -0.005 },
    { price: 46800, change: -0.005 },
    { price: 46600, change: -0.005 },
    { price: 46400, change: -0.005 },
    { price: 46200, change: -0.005 },
    { price: 46000, change: -0.005 },
    { price: 45800, change: -0.005 },
    { price: 45600, change: -0.005 },
    { price: 45400, change: -0.005 },
    { price: 45000, change: -0.009 },
  ]),

  /**
   * Escenario 12: Fuerte tendencia bajista
   */
  strong_downtrend: generateScenario([
    { price: 46000, change: -0.004 },
    { price: 45800, change: -0.005 },
    { price: 45600, change: -0.005 },
    { price: 45400, change: -0.005 },
    { price: 45200, change: -0.005 },
    { price: 45000, change: -0.005 },
    { price: 44800, change: -0.005 },
    { price: 44600, change: -0.005 },
    { price: 44400, change: -0.005 },
    { price: 44200, change: -0.005 },
    { price: 44000, change: -0.005 },
    { price: 43800, change: -0.005 },
    { price: 43600, change: -0.005 },
    { price: 43400, change: -0.005 },
    { price: 43200, change: -0.005 },
    { price: 43000, change: -0.005 },
    { price: 42800, change: -0.005 },
    { price: 42500, change: -0.007 },
  ]),

  /**
   * Escenario 13: Declive gradual con rebotes
   */
  gradual_decline: generateScenario([
    { price: 43000, change: -0.002 },
    { price: 42900, change: -0.002 },
    { price: 42800, change: -0.002 },
    { price: 42900, change: 0.002 },
    { price: 43000, change: 0.002 },
    { price: 42900, change: -0.002 },
    { price: 42700, change: -0.005 },
    { price: 42500, change: -0.005 },
    { price: 42400, change: -0.002 },
    { price: 42500, change: 0.002 },
    { price: 42400, change: -0.002 },
    { price: 42200, change: -0.005 },
    { price: 42000, change: -0.005 },
    { price: 41900, change: -0.002 },
    { price: 41800, change: -0.002 },
    { price: 41600, change: -0.005 },
    { price: 41400, change: -0.005 },
    { price: 41200, change: -0.005 },
    { price: 41000, change: -0.005 },
  ]),

  /**
   * Escenario 14: Rompmiento de soporte
   */
  break_down: generateScenario([
    { price: 41500, change: -0.001 },
    { price: 41450, change: -0.001 },
    { price: 41400, change: -0.001 },
    { price: 41450, change: 0.001 },
    { price: 41500, change: 0.001 },
    { price: 41400, change: -0.002 },
    { price: 41300, change: -0.002 },
    { price: 41200, change: -0.002 },
    { price: 41100, change: -0.002 },
    { price: 41000, change: -0.002 },
    { price: 40800, change: -0.004 }, // Breakdown
    { price: 40500, change: -0.007 },
    { price: 40200, change: -0.007 },
    { price: 39900, change: -0.007 },
    { price: 39600, change: -0.007 },
    { price: 39300, change: -0.007 },
    { price: 39000, change: -0.006 },
  ]),

  /**
   * Escenario 15: Impulso con gaps bajistas
   */
  momentum_drop: generateScenario([
    { price: 45000, change: -0.003 },
    { price: 44800, change: -0.005 },
    { price: 44600, change: -0.005 },
    { price: 44500, change: -0.002 },
    { price: 44300, change: -0.005 },
    { price: 44100, change: -0.005 },
    { price: 44000, change: -0.002 },
    { price: 43700, change: -0.007 }, // Gap down
    { price: 43400, change: -0.007 },
    { price: 43200, change: -0.005 },
    { price: 43000, change: -0.005 },
    { price: 42800, change: -0.005 },
    { price: 42500, change: -0.007 },
    { price: 42200, change: -0.007 },
  ]),

  /**
   * Escenario 16: Doble techo caída
   */
  double_top_drop: generateScenario([
    { price: 44000, change: 0.004 },
    { price: 44200, change: 0.005 },
    { price: 44500, change: 0.007 },
    { price: 44800, change: 0.007 },
    { price: 45000, change: 0.005 },
    { price: 44800, change: -0.005 },
    { price: 44600, change: -0.005 },
    { price: 44500, change: -0.002 },
    { price: 44700, change: 0.005 },
    { price: 45000, change: 0.007 }, // Second top
    { price: 44800, change: -0.005 },
    { price: 44500, change: -0.007 },
    { price: 44000, change: -0.010 },
    { price: 43500, change: -0.012 },
  ]),

  /**
   * Escenario 17: Triángulo descendente
   */
  descending_triangle: generateScenario([
    { price: 42000, change: -0.002 },
    { price: 41900, change: -0.002 },
    { price: 41850, change: -0.001 },
    { price: 41800, change: -0.001 },
    { price: 41800, change: 0.000 },
    { price: 41700, change: -0.002 },
    { price: 41650, change: -0.001 },
    { price: 41600, change: -0.001 },
    { price: 41600, change: 0.000 },
    { price: 41500, change: -0.002 },
    { price: 41450, change: -0.001 },
    { price: 41400, change: -0.001 },
    { price: 41300, change: -0.002 },
    { price: 41100, change: -0.004 }, // Breakdown
    { price: 40800, change: -0.007 },
    { price: 40500, change: -0.007 },
  ]),

  /**
   * Escenario 18: Reversión bajista desde resistencia
   */
  bearish_reversal: generateScenario([
    { price: 46000, change: 0.005 },
    { price: 46400, change: 0.010 },
    { price: 46800, change: 0.010 },
    { price: 47000, change: 0.005 },
    { price: 47200, change: 0.005 }, // Resistencia
    { price: 47000, change: -0.005 },
    { price: 46700, change: -0.008 },
    { price: 46400, change: -0.008 },
    { price: 46000, change: -0.010 },
    { price: 45600, change: -0.010 },
    { price: 45200, change: -0.010 },
    { price: 44800, change: -0.010 },
  ]),

  /**
   * Escenario 19: Resistencia en línea de tendencia
   */
  trendline_resistance: generateScenario([
    { price: 43000, change: -0.003 },
    { price: 42800, change: -0.005 },
    { price: 42600, change: -0.005 },
    { price: 42500, change: -0.002 },
    { price: 42600, change: 0.002 },
    { price: 42700, change: 0.002 },
    { price: 42800, change: 0.002 },
    { price: 42900, change: 0.002 },
    { price: 43000, change: 0.002 }, // Trendline resistance
    { price: 42900, change: -0.002 },
    { price: 42700, change: -0.005 },
    { price: 42500, change: -0.005 },
    { price: 42300, change: -0.005 },
    { price: 42100, change: -0.005 },
    { price: 41900, change: -0.005 },
    { price: 41700, change: -0.005 },
  ]),

  /**
   * Escenario 20: Aumento de volumen bajistas
   */
  volume_surge_bearish: generateScenario([
    { price: 44000, change: -0.002 },
    { price: 43900, change: -0.002 },
    { price: 43800, change: -0.002 },
    { price: 43800, change: 0.000 },
    { price: 43900, change: 0.002 },
    { price: 44000, change: 0.002 },
    { price: 43900, change: -0.002 },
    { price: 43700, change: -0.005 },
    { price: 43500, change: -0.005 },
    { price: 43300, change: -0.005 },
    { price: 43000, change: -0.007 }, // Volume surge
    { price: 42600, change: -0.009 },
    { price: 42200, change: -0.009 },
    { price: 41800, change: -0.009 },
  ]),

  // ============================================================
  // RANGING (10 scenarios)
  // ============================================================

  /**
   * Escenario 21: Mercado lateral
   */
  ranging: generateScenario([
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
  ]),

  /**
   * Escenario 22: Consolidación
   */
  consolidation: generateScenario([
    { price: 45000, change: 0.001 },
    { price: 45050, change: 0.001 },
    { price: 45100, change: 0.001 },
    { price: 45050, change: -0.001 },
    { price: 45000, change: -0.001 },
    { price: 45050, change: 0.001 },
    { price: 45100, change: 0.001 },
    { price: 45150, change: 0.001 },
    { price: 45200, change: 0.001 },
    { price: 45150, change: -0.001 },
    { price: 45100, change: -0.001 },
    { price: 45050, change: -0.001 },
    { price: 45000, change: -0.001 },
    { price: 45050, change: 0.001 },
    { price: 45100, change: 0.001 },
    { price: 45150, change: 0.001 },
    { price: 45200, change: 0.001 },
    { price: 45150, change: -0.001 },
    { price: 45100, change: -0.001 },
    { price: 45050, change: -0.001 },
  ]),

  /**
   * Escenario 23: Canal delimitado
   */
  channel_bound: generateScenario([
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.002 },
    { price: 44200, change: 0.002 },
    { price: 44300, change: 0.002 },
    { price: 44400, change: 0.002 }, // Upper bound
    { price: 44300, change: -0.002 },
    { price: 44200, change: -0.002 },
    { price: 44100, change: -0.002 },
    { price: 44000, change: -0.002 },
    { price: 43900, change: -0.002 }, // Lower bound
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.002 },
    { price: 44200, change: 0.002 },
    { price: 44300, change: 0.002 },
    { price: 44400, change: 0.002 },
    { price: 44300, change: -0.002 },
    { price: 44200, change: -0.002 },
    { price: 44100, change: -0.002 },
    { price: 44000, change: -0.002 },
    { price: 43900, change: -0.002 },
  ]),

  /**
   * Escenario 24: Rango estrecho
   */
  tight_range: generateScenario([
    { price: 44500, change: 0.001 },
    { price: 44520, change: 0.001 },
    { price: 44540, change: 0.001 },
    { price: 44520, change: -0.001 },
    { price: 44500, change: -0.001 },
    { price: 44520, change: 0.001 },
    { price: 44540, change: 0.001 },
    { price: 44560, change: 0.001 },
    { price: 44540, change: -0.001 },
    { price: 44520, change: -0.001 },
    { price: 44500, change: -0.001 },
    { price: 44520, change: 0.001 },
    { price: 44540, change: 0.001 },
    { price: 44520, change: -0.001 },
    { price: 44500, change: -0.001 },
    { price: 44520, change: 0.001 },
    { price: 44540, change: 0.001 },
    { price: 44560, change: 0.001 },
    { price: 44540, change: -0.001 },
    { price: 44520, change: -0.001 },
  ]),

  /**
   * Escenario 25: Rango amplio
   */
  wide_range: generateScenario([
    { price: 43000, change: 0.005 },
    { price: 43200, change: 0.005 },
    { price: 43400, change: 0.005 },
    { price: 43600, change: 0.005 },
    { price: 43800, change: 0.005 },
    { price: 43600, change: -0.005 },
    { price: 43400, change: -0.005 },
    { price: 43200, change: -0.005 },
    { price: 43000, change: -0.005 },
    { price: 42800, change: -0.005 },
    { price: 43000, change: 0.005 },
    { price: 43200, change: 0.005 },
    { price: 43400, change: 0.005 },
    { price: 43600, change: 0.005 },
    { price: 43800, change: 0.005 },
    { price: 43600, change: -0.005 },
    { price: 43400, change: -0.005 },
    { price: 43200, change: -0.005 },
  ]),

  /**
   * Escenario 26: Patrón de caja
   */
  box_pattern: generateScenario([
    { price: 42000, change: 0.003 },
    { price: 42100, change: 0.003 },
    { price: 42200, change: 0.003 },
    { price: 42300, change: 0.003 },
    { price: 42400, change: 0.003 },
    { price: 42300, change: -0.003 },
    { price: 42200, change: -0.003 },
    { price: 42100, change: -0.003 },
    { price: 42000, change: -0.003 },
    { price: 41900, change: -0.003 },
    { price: 41800, change: -0.003 },
    { price: 41900, change: 0.003 },
    { price: 42000, change: 0.003 },
    { price: 42100, change: 0.003 },
    { price: 42200, change: 0.003 },
    { price: 42300, change: 0.003 },
    { price: 42400, change: 0.003 },
    { price: 42300, change: -0.003 },
    { price: 42200, change: -0.003 },
    { price: 42100, change: -0.003 },
  ]),

  /**
   * Escenario 27: Canal plano
   */
  flat_channel: generateScenario([
    { price: 45000, change: 0.002 },
    { price: 45050, change: 0.001 },
    { price: 45100, change: 0.001 },
    { price: 45100, change: 0.000 },
    { price: 45050, change: -0.001 },
    { price: 45000, change: -0.001 },
    { price: 45050, change: 0.001 },
    { price: 45100, change: 0.001 },
    { price: 45150, change: 0.001 },
    { price: 45100, change: -0.001 },
    { price: 45050, change: -0.001 },
    { price: 45000, change: -0.001 },
    { price: 45050, change: 0.001 },
    { price: 45100, change: 0.001 },
    { price: 45100, change: 0.000 },
    { price: 45050, change: -0.001 },
    { price: 45000, change: -0.001 },
  ]),

  /**
   * Escenario 28: Acumulación en rango
   */
  accumulating_range: generateScenario([
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.003 },
    { price: 44200, change: 0.003 },
    { price: 44300, change: 0.003 },
    { price: 44350, change: 0.001 },
    { price: 44300, change: -0.001 },
    { price: 44200, change: -0.002 },
    { price: 44100, change: -0.002 },
    { price: 44000, change: -0.002 },
    { price: 43900, change: -0.002 },
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.002 },
    { price: 44200, change: 0.002 },
    { price: 44300, change: 0.002 },
    { price: 44400, change: 0.002 },
    { price: 44450, change: 0.001 },
    { price: 44400, change: -0.001 },
  ]),

  /**
   * Escenario 29: Distribución en rango
   */
  distributing_range: generateScenario([
    { price: 46000, change: -0.002 },
    { price: 45900, change: -0.003 },
    { price: 45800, change: -0.003 },
    { price: 45700, change: -0.003 },
    { price: 45650, change: -0.001 },
    { price: 45700, change: 0.001 },
    { price: 45800, change: 0.002 },
    { price: 45900, change: 0.002 },
    { price: 46000, change: 0.002 },
    { price: 46100, change: 0.002 },
    { price: 46000, change: -0.002 },
    { price: 45900, change: -0.002 },
    { price: 45800, change: -0.002 },
    { price: 45700, change: -0.002 },
    { price: 45600, change: -0.002 },
    { price: 45550, change: -0.001 },
    { price: 45600, change: 0.001 },
  ]),

  /**
   * Escenario 30: Mercado neutral
   */
  neutral_market: generateScenario([
    { price: 44500, change: 0.001 },
    { price: 44550, change: 0.001 },
    { price: 44600, change: 0.001 },
    { price: 44550, change: -0.001 },
    { price: 44500, change: -0.001 },
    { price: 44450, change: -0.001 },
    { price: 44400, change: -0.001 },
    { price: 44450, change: 0.001 },
    { price: 44500, change: 0.001 },
    { price: 44550, change: 0.001 },
    { price: 44600, change: 0.001 },
    { price: 44550, change: -0.001 },
    { price: 44500, change: -0.001 },
    { price: 44450, change: -0.001 },
    { price: 44400, change: -0.001 },
    { price: 44450, change: 0.001 },
    { price: 44500, change: 0.001 },
    { price: 44550, change: 0.001 },
    { price: 44600, change: 0.001 },
    { price: 44550, change: -0.001 },
  ]),

  // ============================================================
  // HIGH VOLATILITY (5 scenarios)
  // ============================================================

  /**
   * Escenario 31: Flash crash
   */
  flash_crash: generateScenario([
    { price: 50000, change: -0.001 },
    { price: 49800, change: -0.004 },
    { price: 49400, change: -0.008 },
    { price: 48800, change: -0.012 },
    { price: 48000, change: -0.016 },
    { price: 47000, change: -0.021 },
    { price: 47500, change: 0.011 },
    { price: 48000, change: 0.011 },
    { price: 48500, change: 0.010 },
    { price: 49000, change: 0.010 },
    { price: 49500, change: 0.010 },
    { price: 50000, change: 0.010 },
  ]),

  /**
   * Escenario 32: Rally parabólico
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

  /**
   * Escenario 33: Pico de volatilidad
   */
  volatile_spike: generateScenario([
    { price: 45000, change: 0.002 },
    { price: 45100, change: 0.002 },
    { price: 44800, change: -0.007 }, // Spike down
    { price: 44500, change: -0.007 },
    { price: 44200, change: -0.007 },
    { price: 44600, change: 0.009 }, // Spike up
    { price: 45000, change: 0.009 },
    { price: 45400, change: 0.009 },
    { price: 45200, change: -0.004 },
    { price: 44800, change: -0.009 }, // Another spike
    { price: 44500, change: -0.007 },
    { price: 45000, change: 0.011 },
    { price: 45500, change: 0.011 },
    { price: 45200, change: -0.007 },
    { price: 44800, change: -0.009 },
  ]),

  /**
   * Escenario 34: Gap por noticias
   */
  news_gap: generateScenario([
    { price: 43000, change: 0.001 },
    { price: 43100, change: 0.002 },
    { price: 43200, change: 0.002 },
    { price: 43100, change: -0.002 },
    { price: 43000, change: -0.002 },
    { price: 43100, change: 0.002 },
    { price: 43200, change: 0.002 },
    { price: 43500, change: 0.007 }, // Gap up - news
    { price: 44000, change: 0.011 },
    { price: 44500, change: 0.011 },
    { price: 44200, change: -0.007 },
    { price: 43800, change: -0.009 },
    { price: 43500, change: -0.007 },
    { price: 44000, change: 0.011 },
    { price: 44500, change: 0.011 },
  ]),

  /**
   * Escenario 35: Movimientos whipsaw
   */
  whipsaw: generateScenario([
    { price: 44000, change: 0.005 },
    { price: 44500, change: 0.011 },
    { price: 44000, change: -0.011 },
    { price: 43500, change: -0.011 },
    { price: 44000, change: 0.011 },
    { price: 44500, change: 0.011 },
    { price: 44000, change: -0.011 },
    { price: 43500, change: -0.011 },
    { price: 44000, change: 0.011 },
    { price: 44500, change: 0.011 },
    { price: 44000, change: -0.011 },
    { price: 43500, change: -0.011 },
    { price: 44000, change: 0.011 },
    { price: 44500, change: 0.011 },
    { price: 44000, change: -0.011 },
    { price: 43500, change: -0.011 },
  ]),

  // ============================================================
  // LOW VOLATILITY (5 scenarios)
  // ============================================================

  /**
   * Escenario 36: Tendencia alcista tranquila
   */
  calm_uptrend: generateScenario([
    { price: 42000, change: 0.001 },
    { price: 42050, change: 0.001 },
    { price: 42100, change: 0.001 },
    { price: 42150, change: 0.001 },
    { price: 42200, change: 0.001 },
    { price: 42250, change: 0.001 },
    { price: 42300, change: 0.001 },
    { price: 42350, change: 0.001 },
    { price: 42400, change: 0.001 },
    { price: 42450, change: 0.001 },
    { price: 42500, change: 0.001 },
    { price: 42550, change: 0.001 },
    { price: 42600, change: 0.001 },
    { price: 42650, change: 0.001 },
    { price: 42700, change: 0.001 },
    { price: 42750, change: 0.001 },
    { price: 42800, change: 0.001 },
    { price: 42850, change: 0.001 },
  ]),

  /**
   * Escenario 37: Tendencia bajista tranquila
   */
  calm_downtrend: generateScenario([
    { price: 44000, change: -0.001 },
    { price: 43950, change: -0.001 },
    { price: 43900, change: -0.001 },
    { price: 43850, change: -0.001 },
    { price: 43800, change: -0.001 },
    { price: 43750, change: -0.001 },
    { price: 43700, change: -0.001 },
    { price: 43650, change: -0.001 },
    { price: 43600, change: -0.001 },
    { price: 43550, change: -0.001 },
    { price: 43500, change: -0.001 },
    { price: 43450, change: -0.001 },
    { price: 43400, change: -0.001 },
    { price: 43350, change: -0.001 },
    { price: 43300, change: -0.001 },
    { price: 43250, change: -0.001 },
    { price: 43200, change: -0.001 },
    { price: 43150, change: -0.001 },
  ]),

  /**
   * Escenario 38: Rango tranquilo
   */
  quiet_range: generateScenario([
    { price: 45000, change: 0.0005 },
    { price: 45020, change: 0.0005 },
    { price: 45040, change: 0.0005 },
    { price: 45020, change: -0.0005 },
    { price: 45000, change: -0.0005 },
    { price: 44980, change: -0.0005 },
    { price: 45000, change: 0.0005 },
    { price: 45020, change: 0.0005 },
    { price: 45040, change: 0.0005 },
    { price: 45020, change: -0.0005 },
    { price: 45000, change: -0.0005 },
    { price: 44980, change: -0.0005 },
    { price: 45000, change: 0.0005 },
    { price: 45020, change: 0.0005 },
    { price: 45040, change: 0.0005 },
    { price: 45020, change: -0.0005 },
    { price: 45000, change: -0.0005 },
    { price: 44980, change: -0.0005 },
  ]),

  /**
   * Escenario 39: Baja volatilidad
   */
  low_volatility: generateScenario([
    { price: 43500, change: 0.001 },
    { price: 43520, change: 0.001 },
    { price: 43540, change: 0.001 },
    { price: 43520, change: -0.001 },
    { price: 43500, change: -0.001 },
    { price: 43480, change: -0.001 },
    { price: 43500, change: 0.001 },
    { price: 43520, change: 0.001 },
    { price: 43540, change: 0.001 },
    { price: 43560, change: 0.001 },
    { price: 43540, change: -0.001 },
    { price: 43520, change: -0.001 },
    { price: 43500, change: -0.001 },
    { price: 43520, change: 0.001 },
    { price: 43540, change: 0.001 },
    { price: 43560, change: 0.001 },
    { price: 43540, change: -0.001 },
  ]),

  /**
   * Escenario 40: Patrón de compresión
   */
  squeeze_pattern: generateScenario([
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.002 },
    { price: 44000, change: -0.002 },
    { price: 43900, change: -0.002 },
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.002 },
    { price: 44000, change: -0.002 },
    { price: 43900, change: -0.002 },
    { price: 44000, change: 0.002 },
    { price: 44100, change: 0.002 },
    { price: 44050, change: -0.001 },
    { price: 44000, change: -0.001 },
    { price: 43950, change: -0.001 },
    { price: 44000, change: 0.001 },
    { price: 44050, change: 0.001 },
    { price: 44100, change: 0.001 }, // Squeeze break
    { price: 44300, change: 0.005 },
    { price: 44500, change: 0.005 },
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