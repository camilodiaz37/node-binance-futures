// analyzer.ts

import {
  BacktestResultExtended,
  AnalysisReport,
  MarketCondition,
  TradeResultExtended,
} from "./types";
import { scenarioMetadata } from "./scenarioGenerator";

/**
 * Analyze backtest results and generate recommendations
 */
export function analyzeResults(
  results: Record<string, BacktestResultExtended>
): AnalysisReport {
  const scenarioNames = Object.keys(results);
  const totalScenarios = scenarioNames.length;

  // Aggregate metrics
  let totalTrades = 0;
  let totalWins = 0;
  let totalNetProfit = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let slTriggered = 0;
  let tpTriggered = 0;
  let signalClosed = 0;

  // Win rate by market condition
  const conditionWins: Record<MarketCondition, number> = {
    [MarketCondition.TRENDING_UP]: 0,
    [MarketCondition.TRENDING_DOWN]: 0,
    [MarketCondition.RANGING]: 0,
    [MarketCondition.HIGH_VOLATILITY]: 0,
    [MarketCondition.LOW_VOLATILITY]: 0,
  };
  const conditionTrades: Record<MarketCondition, number> = {
    [MarketCondition.TRENDING_UP]: 0,
    [MarketCondition.TRENDING_DOWN]: 0,
    [MarketCondition.RANGING]: 0,
    [MarketCondition.HIGH_VOLATILITY]: 0,
    [MarketCondition.LOW_VOLATILITY]: 0,
  };

  // Process each scenario result
  for (const [scenarioName, result] of Object.entries(results)) {
    totalTrades += result.totalTrades;
    totalWins += result.winningTrades;
    totalNetProfit += result.netProfit;
    totalProfit += result.totalProfit;
    totalLoss += result.totalLoss;
    slTriggered += result.slTriggered;
    tpTriggered += result.tpTriggered;
    signalClosed += result.signalClosed;

    const metadata = scenarioMetadata[scenarioName];
    const condition = metadata?.condition || MarketCondition.RANGING;
    const winningTrades = result.trades.filter((t) => t.profit > 0);

    conditionTrades[condition] += result.totalTrades;
    conditionWins[condition] += winningTrades.length;
  }

  // Calculate win rate by condition
  const winRateByCondition: Record<MarketCondition, number> = {
    [MarketCondition.TRENDING_UP]:
      conditionTrades[MarketCondition.TRENDING_UP] > 0
        ? (conditionWins[MarketCondition.TRENDING_UP] /
            conditionTrades[MarketCondition.TRENDING_UP]) *
          100
        : 0,
    [MarketCondition.TRENDING_DOWN]:
      conditionTrades[MarketCondition.TRENDING_DOWN] > 0
        ? (conditionWins[MarketCondition.TRENDING_DOWN] /
            conditionTrades[MarketCondition.TRENDING_DOWN]) *
          100
        : 0,
    [MarketCondition.RANGING]:
      conditionTrades[MarketCondition.RANGING] > 0
        ? (conditionWins[MarketCondition.RANGING] /
            conditionTrades[MarketCondition.RANGING]) *
          100
        : 0,
    [MarketCondition.HIGH_VOLATILITY]:
      conditionTrades[MarketCondition.HIGH_VOLATILITY] > 0
        ? (conditionWins[MarketCondition.HIGH_VOLATILITY] /
            conditionTrades[MarketCondition.HIGH_VOLATILITY]) *
          100
        : 0,
    [MarketCondition.LOW_VOLATILITY]:
      conditionTrades[MarketCondition.LOW_VOLATILITY] > 0
        ? (conditionWins[MarketCondition.LOW_VOLATILITY] /
            conditionTrades[MarketCondition.LOW_VOLATILITY]) *
          100
        : 0,
  };

  // Calculate overall metrics
  const overallWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

  const totalExits = slTriggered + tpTriggered + signalClosed;
  const slTriggeredPercent = totalExits > 0 ? (slTriggered / totalExits) * 100 : 0;
  const tpTriggeredPercent = totalExits > 0 ? (tpTriggered / totalExits) * 100 : 0;

  // Calculate average win/loss
  const averageWin = totalWins > 0 ? totalProfit / totalWins : 0;
  const averageLoss = totalTrades - totalWins > 0 ? totalLoss / (totalTrades - totalWins) : 0;

  // Generate recommendations
  const recommendations = generateRecommendations(
    overallWinRate,
    winRateByCondition,
    slTriggeredPercent,
    tpTriggeredPercent,
    profitFactor
  );

  // Calculate duration statistics
  const allDurations: number[] = [];
  for (const result of Object.values(results)) {
    for (const trade of result.trades) {
      if (trade.durationMinutes !== undefined) {
        allDurations.push(trade.durationMinutes);
      }
    }
  }

  const avgDurationMinutes = allDurations.length > 0
    ? allDurations.reduce((a, b) => a + b, 0) / allDurations.length
    : 0;
  const minDurationMinutes = allDurations.length > 0 ? Math.min(...allDurations) : 0;
  const maxDurationMinutes = allDurations.length > 0 ? Math.max(...allDurations) : 0;

  return {
    totalScenarios,
    totalTrades,
    overallWinRate,
    totalNetProfit,
    profitFactor,
    averageWin,
    averageLoss,
    winRateByCondition,
    slTriggeredPercent,
    tpTriggeredPercent,
    recommendations,
    avgDurationMinutes,
    minDurationMinutes,
    maxDurationMinutes,
  };
}

/**
 * Generate strategy recommendations based on analysis
 */
function generateRecommendations(
  winRate: number,
  winRateByCondition: Record<MarketCondition, number>,
  slPercent: number,
  tpPercent: number,
  profitFactor: number
): string[] {
  const recommendations: string[] = [];

  // Win rate recommendations
  if (winRate < 40) {
    recommendations.push(
      "Win rate is below 40% - consider adjusting entry signals or reducing position size"
    );
  } else if (winRate < 50) {
    recommendations.push(
      "Win rate between 40-50% - improve entry timing or adjust SL/TP ratios"
    );
  }

  // Market condition performance
  const conditions = Object.entries(winRateByCondition);
  const bestCondition = conditions.reduce((best, [cond, rate]) =>
    rate > best[1] ? [cond, rate] : best
  , ["", 0] as [string, number]);

  const worstCondition = conditions.reduce((worst, [cond, rate]) =>
    rate < worst[1] ? [cond, rate] : worst
  , ["", 100] as [string, number]);

  if (bestCondition[1] > 0) {
    recommendations.push(
      `Best performance in ${bestCondition[0].replace("_", " ")} conditions (${bestCondition[1].toFixed(1)}% win rate)`
    );
  }

  if (worstCondition[1] < 50 && worstCondition[1] > 0) {
    recommendations.push(
      `Consider avoiding or adjusting strategy for ${worstCondition[0].replace("_", " ")} conditions (${worstCondition[1].toFixed(1)}% win rate)`
    );
  }

  // SL/TP recommendations
  if (slPercent > tpPercent * 2) {
    recommendations.push(
      "High SL trigger rate - consider widening stop loss or reducing position size"
    );
  }

  if (tpPercent > 70) {
    recommendations.push(
      "High TP trigger rate - strategy has good momentum capture, consider trailing stop"
    );
  }

  // Profit factor recommendations
  if (profitFactor === Infinity) {
    recommendations.push("No losing trades - consider this may be unrealistic for live trading");
  } else if (profitFactor > 0 && profitFactor < 1) {
    recommendations.push(
      "Profit factor below 1 - strategy is losing money, review entry/exit logic"
    );
  } else if (profitFactor >= 1.5) {
    recommendations.push(
      "Good profit factor - strategy shows solid risk-reward characteristics"
    );
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push("Strategy shows balanced performance across conditions");
    recommendations.push("Consider testing with different timeframes for optimization");
  }

  return recommendations;
}

/**
 * Print analysis report to console
 */
export function printAnalysisReport(report: AnalysisReport): void {
  console.log("\n" + "=".repeat(60));
  console.log("📊 ANÁLISIS DE RESULTADOS");
  console.log("=".repeat(60));

  console.log(`\n📈 Estadísticas Generales:`);
  console.log(`   Escenarios ejecutados: ${report.totalScenarios}`);
  console.log(`   Total de operaciones: ${report.totalTrades}`);
  console.log(`   Win Rate Overall: ${report.overallWinRate.toFixed(2)}%`);
  console.log(`   Profit Factor: ${report.profitFactor === Infinity ? "∞" : report.profitFactor.toFixed(2)}`);
  console.log(`   Ganancia promedio por trade ganador: $${report.averageWin.toFixed(2)}`);
  console.log(`   Pérdida promedio por trade perdedor: $${report.averageLoss.toFixed(2)}`);
  console.log(`   Profit neto total: $${report.totalNetProfit.toFixed(2)}`);

  console.log(`\n📉 Win Rate por Condición de Mercado:`);
  console.log(`   Trending Up: ${report.winRateByCondition[MarketCondition.TRENDING_UP].toFixed(1)}%`);
  console.log(`   Trending Down: ${report.winRateByCondition[MarketCondition.TRENDING_DOWN].toFixed(1)}%`);
  console.log(`   Ranging: ${report.winRateByCondition[MarketCondition.RANGING].toFixed(1)}%`);
  console.log(`   High Volatility: ${report.winRateByCondition[MarketCondition.HIGH_VOLATILITY].toFixed(1)}%`);
  console.log(`   Low Volatility: ${report.winRateByCondition[MarketCondition.LOW_VOLATILITY].toFixed(1)}%`);

  console.log(`\n🎯 Triggers de Salida:`);
  console.log(`   Stop Loss: ${report.slTriggeredPercent.toFixed(1)}%`);
  console.log(`   Take Profit: ${report.tpTriggeredPercent.toFixed(1)}%`);

  console.log(`\n⏱️  Duración de Operaciones:`);
  console.log(`   Promedio: ${report.avgDurationMinutes.toFixed(1)} minutos`);
  console.log(`   Mínimo: ${report.minDurationMinutes.toFixed(0)} minutos`);
  console.log(`   Máximo: ${report.maxDurationMinutes.toFixed(0)} minutos`);

  console.log(`\n💡 Recomendaciones:`);
  report.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  console.log("=".repeat(60));
}