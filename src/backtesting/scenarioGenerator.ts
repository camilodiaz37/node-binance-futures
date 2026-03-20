// scenarioGenerator.ts

import { Kline, MarketCondition, ScenarioMetadata } from "./types";

/**
 * Scenario metadata registry - maps scenario names to their conditions
 */
export const scenarioMetadata: Record<string, ScenarioMetadata> = {
  // Trending Up (10 scenarios)
  bullish_volatile: {
    name: "bullish_volatile",
    condition: MarketCondition.TRENDING_UP,
    description: "Tendencia alcista con volatilidad",
  },
  strong_uptrend: {
    name: "strong_uptrend",
    condition: MarketCondition.TRENDING_UP,
    description: "Fuerte tendencia alcista",
  },
  gradual_rally: {
    name: "gradual_rally",
    condition: MarketCondition.TRENDING_UP,
    description: "Rally gradual con retrocesos",
  },
  break_out: {
    name: "break_out",
    condition: MarketCondition.TRENDING_UP,
    description: "Rompmiento de resistencia",
  },
  momentum_gap: {
    name: "momentum_gap",
    condition: MarketCondition.TRENDING_UP,
    description: "Impulso con gaps alcistas",
  },
  double_bottom_bounce: {
    name: "double_bottom_bounce",
    condition: MarketCondition.TRENDING_UP,
    description: "Doble suelo rebote",
  },
  ascending_triangle: {
    name: "ascending_triangle",
    condition: MarketCondition.TRENDING_UP,
    description: "Triángulo ascendente",
  },
  bullish_reversal: {
    name: "bullish_reversal",
    condition: MarketCondition.TRENDING_UP,
    description: "Reversión alcista desde soporte",
  },
  trendline_support: {
    name: "trendline_support",
    condition: MarketCondition.TRENDING_UP,
    description: "Soporte en línea de tendencia",
  },
  volume_surge: {
    name: "volume_surge",
    condition: MarketCondition.TRENDING_UP,
    description: "Aumento de volumen alcistas",
  },

  // Trending Down (10 scenarios)
  bearish_volatile: {
    name: "bearish_volatile",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Tendencia bajista con volatilidad",
  },
  strong_downtrend: {
    name: "strong_downtrend",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Fuerte tendencia bajista",
  },
  gradual_decline: {
    name: "gradual_decline",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Declive gradual con rebotes",
  },
  break_down: {
    name: "break_down",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Rompmiento de soporte",
  },
  momentum_drop: {
    name: "momentum_drop",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Impuesto con gaps bajistas",
  },
  double_top_drop: {
    name: "double_top_drop",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Doble techo caída",
  },
  descending_triangle: {
    name: "descending_triangle",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Triángulo descendente",
  },
  bearish_reversal: {
    name: "bearish_reversal",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Reversión bajista desde resistencia",
  },
  trendline_resistance: {
    name: "trendline_resistance",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Resistencia en línea de tendencia",
  },
  volume_surge_bearish: {
    name: "volume_surge_bearish",
    condition: MarketCondition.TRENDING_DOWN,
    description: "Aumento de volumen bajistas",
  },

  // Ranging (10 scenarios)
  ranging: {
    name: "ranging",
    condition: MarketCondition.RANGING,
    description: "Mercado lateral",
  },
  consolidation: {
    name: "consolidation",
    condition: MarketCondition.RANGING,
    description: "Consolidación",
  },
  channel_bound: {
    name: "channel_bound",
    condition: MarketCondition.RANGING,
    description: "Canal delimitado",
  },
  tight_range: {
    name: "tight_range",
    condition: MarketCondition.RANGING,
    description: "Rango estrecho",
  },
  wide_range: {
    name: "wide_range",
    condition: MarketCondition.RANGING,
    description: "Rango amplio",
  },
  box_pattern: {
    name: "box_pattern",
    condition: MarketCondition.RANGING,
    description: "Patrón de caja",
  },
  flat_channel: {
    name: "flat_channel",
    condition: MarketCondition.RANGING,
    description: "Canal plano",
  },
  accumulating_range: {
    name: "accumulating_range",
    condition: MarketCondition.RANGING,
    description: "Acumulación en rango",
  },
  distributing_range: {
    name: "distributing_range",
    condition: MarketCondition.RANGING,
    description: "Distribución en rango",
  },
  neutral_market: {
    name: "neutral_market",
    condition: MarketCondition.RANGING,
    description: "Mercado neutral",
  },

  // High Volatility (5 scenarios)
  flash_crash: {
    name: "flash_crash",
    condition: MarketCondition.HIGH_VOLATILITY,
    description: "Caída rápida y recuperación",
  },
  parabolic_rally: {
    name: "parabolic_rally",
    condition: MarketCondition.HIGH_VOLATILITY,
    description: "Subida parabólica",
  },
  volatile_spike: {
    name: "volatile_spike",
    condition: MarketCondition.HIGH_VOLATILITY,
    description: "Pico de volatilidad",
  },
  news_gap: {
    name: "news_gap",
    condition: MarketCondition.HIGH_VOLATILITY,
    description: "Gap por noticias",
  },
  whipsaw: {
    name: "whipsaw",
    condition: MarketCondition.HIGH_VOLATILITY,
    description: "Movimientos whipsaw",
  },

  // Low Volatility (5 scenarios)
  calm_uptrend: {
    name: "calm_uptrend",
    condition: MarketCondition.LOW_VOLATILITY,
    description: "Tendencia alcista tranquila",
  },
  calm_downtrend: {
    name: "calm_downtrend",
    condition: MarketCondition.LOW_VOLATILITY,
    description: "Tendencia bajista tranquila",
  },
  quiet_range: {
    name: "quiet_range",
    condition: MarketCondition.LOW_VOLATILITY,
    description: "Rango tranquilo",
  },
  low_volatility: {
    name: "low_volatility",
    condition: MarketCondition.LOW_VOLATILITY,
    description: "Baja volatilidad",
  },
  squeeze_pattern: {
    name: "squeeze_pattern",
    condition: MarketCondition.LOW_VOLATILITY,
    description: "Patrón de compresión",
  },
};

/**
 * Get metadata for a scenario
 */
export function getScenarioMetadata(
  scenarioName: string
): ScenarioMetadata | undefined {
  return scenarioMetadata[scenarioName];
}

/**
 * Get all scenario names
 */
export function getAllScenarioNames(): string[] {
  return Object.keys(scenarioMetadata);
}

/**
 * Get scenarios by market condition
 */
export function getScenariosByCondition(
  condition: MarketCondition
): string[] {
  return Object.values(scenarioMetadata)
    .filter((meta) => meta.condition === condition)
    .map((meta) => meta.name);
}

/**
 * Get scenario count by condition
 */
export function getScenarioCountByCondition(): Record<MarketCondition, number> {
  const counts: Record<MarketCondition, number> = {
    [MarketCondition.TRENDING_UP]: 0,
    [MarketCondition.TRENDING_DOWN]: 0,
    [MarketCondition.RANGING]: 0,
    [MarketCondition.HIGH_VOLATILITY]: 0,
    [MarketCondition.LOW_VOLATILITY]: 0,
  };

  for (const meta of Object.values(scenarioMetadata)) {
    counts[meta.condition]++;
  }

  return counts;
}

/**
 * Generate random scenario selection
 */
export function getRandomScenarios(
  count: number = 40,
  conditions?: MarketCondition[]
): string[] {
  const allNames = conditions
    ? getScenariosByCondition(conditions[0])
    : getAllScenarioNames();

  // Shuffle array
  const shuffled = [...allNames].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}