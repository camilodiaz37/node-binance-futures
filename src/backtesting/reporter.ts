// reporter.ts

import { BacktestResultExtended, AnalysisReport, MarketCondition } from "./types";

/**
 * Generate comprehensive report with summary table and recommendations
 */
export function generateReport(
  results: Record<string, BacktestResultExtended>,
  analysis: AnalysisReport
): string {
  const lines: string[] = [];

  // Header
  lines.push("=".repeat(70));
  lines.push("📋 REPORTE DE BACKTESTING - 40 ESCENARIOS");
  lines.push("=".repeat(70));

  // Summary table
  lines.push("\n📊 RESUMEN DE ESCENARIOS");
  lines.push("-".repeat(70));
  lines.push(
    formatTableRow(["Escenario", "Condición", "Trades", "Win%", "P/L", "SL", "TP"])
  );
  lines.push("-".repeat(70));

  for (const [scenarioName, result] of Object.entries(results)) {
    const condition = result.scenarioCondition.replace("_", " ").toUpperCase();
    const pnl = result.netProfit >= 0 ? `+$${result.netProfit.toFixed(2)}` : `-$${Math.abs(result.netProfit).toFixed(2)}`;
    lines.push(
      formatTableRow([
        scenarioName.substring(0, 20),
        condition.substring(0, 15),
        result.totalTrades.toString(),
        `${result.winRate.toFixed(1)}%`,
        pnl,
        result.slTriggered.toString(),
        result.tpTriggered.toString(),
      ])
    );
  }

  lines.push("-".repeat(70));

  // Aggregate summary
  const totalTrades = Object.values(results).reduce((sum, r) => sum + r.totalTrades, 0);
  const totalWins = Object.values(results).reduce((sum, r) => sum + r.winningTrades, 0);
  const totalNetProfit = Object.values(results).reduce((sum, r) => sum + r.netProfit, 0);

  lines.push(
    formatTableRow([
      "TOTAL",
      "-",
      totalTrades.toString(),
      `${(totalWins / totalTrades * 100).toFixed(1)}%`,
      totalNetProfit >= 0 ? `+$${totalNetProfit.toFixed(2)}` : `-$${Math.abs(totalNetProfit).toFixed(2)}`,
      "-",
      "-",
    ])
  );

  // Analysis section
  lines.push("\n" + "=".repeat(70));
  lines.push("📈 ANÁLISIS DE RENDIMIENTO");
  lines.push("=".repeat(70));

  lines.push(`\n🎯 Métricas Generales:`);
  lines.push(`   Total de escenarios: ${analysis.totalScenarios}`);
  lines.push(`   Total de operaciones: ${analysis.totalTrades}`);
  lines.push(`   Win Rate Overall: ${analysis.overallWinRate.toFixed(2)}%`);
  lines.push(`   Profit Factor: ${analysis.profitFactor === Infinity ? "∞" : analysis.profitFactor.toFixed(2)}`);
  lines.push(`   Ganancia promedio (ganador): $${analysis.averageWin.toFixed(2)}`);
  lines.push(`   Pérdida promedio (perdedor): $${analysis.averageLoss.toFixed(2)}`);
  lines.push(`   Profit neto total: $${analysis.totalNetProfit.toFixed(2)}`);

  lines.push(`\n📉 Win Rate por Condición de Mercado:`);
  lines.push(
    `   Trending Up:      ${analysis.winRateByCondition[MarketCondition.TRENDING_UP].toFixed(1)}%`
  );
  lines.push(
    `   Trending Down:    ${analysis.winRateByCondition[MarketCondition.TRENDING_DOWN].toFixed(1)}%`
  );
  lines.push(
    `   Ranging:          ${analysis.winRateByCondition[MarketCondition.RANGING].toFixed(1)}%`
  );
  lines.push(
    `   High Volatility:  ${analysis.winRateByCondition[MarketCondition.HIGH_VOLATILITY].toFixed(1)}%`
  );
  lines.push(
    `   Low Volatility:   ${analysis.winRateByCondition[MarketCondition.LOW_VOLATILITY].toFixed(1)}%`
  );

  lines.push(`\n🎯 Triggers de Salida:`);
  lines.push(`   Stop Loss triggered: ${analysis.slTriggeredPercent.toFixed(1)}%`);
  lines.push(`   Take Profit triggered: ${analysis.tpTriggeredPercent.toFixed(1)}%`);

  // Duration statistics
  lines.push(`\n⏱️  Duración de Operaciones:`);
  lines.push(`   Promedio: ${analysis.avgDurationMinutes.toFixed(1)} minutos`);
  lines.push(`   Mínimo: ${analysis.minDurationMinutes.toFixed(0)} minutos`);
  lines.push(`   Máximo: ${analysis.maxDurationMinutes.toFixed(0)} minutos`);

  // Recommendations
  lines.push("\n" + "=".repeat(70));
  lines.push("💡 RECOMENDACIONES");
  lines.push("=".repeat(70));

  analysis.recommendations.forEach((rec, i) => {
    lines.push(`\n   ${i + 1}. ${rec}`);
  });

  // Footer
  lines.push("\n" + "=".repeat(70));
  lines.push(`Reporte generado: ${new Date().toISOString()}`);
  lines.push("=".repeat(70));

  return lines.join("\n");
}

/**
 * Format a table row with consistent column widths
 */
function formatTableRow(values: string[]): string {
  const widths = [22, 17, 8, 8, 12, 6, 6];
  const aligned = values.map((v, i) => v.padEnd(widths[i]).substring(0, widths[i]));
  return "   " + aligned.join(" | ");
}

/**
 * Print report to console
 */
export function printReport(report: string): void {
  console.log(report);
}

/**
 * Save report to file
 */
export function saveReport(report: string, filepath: string): void {
  // This would require fs module - placeholder for file output
  console.log(`\n💾 Report saved to: ${filepath}`);
}