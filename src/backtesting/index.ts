import {
  runBacktestExtended,
  runAllBacktestsExtended,
  printResults,
} from "./engine";
import { analyzeResults, printAnalysisReport } from "./analyzer";
import { generateReport, printReport } from "./reporter";
import { BacktestConfig } from "./types";

/**
 * Backtesting CLI
 * Ejecutar: npm run backtest
 */

console.log("\n🧪 BACKTESTING - Estrategia Bollinger Bands + RSI");
console.log("=".repeat(60));
console.log("📊 40 ESCENARIOS - Backtesting and Strategy Analysis");
console.log("=".repeat(60));

// Get config from environment or use defaults
const config: Partial<BacktestConfig> = {
  stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || "2"),
  takeProfitPercent: parseFloat(process.env.TAKE_PROFIT_PERCENT || "4"),
};

// Ejecutar todos los escenarios con tracking extendido
console.log("\n🔄 Ejecutando backtests...");
const results = runAllBacktestsExtended(config);

// Resumen general
console.log("\n" + "=".repeat(60));
console.log("📈 RESUMEN GENERAL");
console.log("=".repeat(60));

for (const [scenario, result] of Object.entries(results)) {
  printResults(scenario, result);
}

// Análisis de resultados
console.log("\n📊 Generando análisis...");
const analysis = analyzeResults(results);

// Mostrar análisis en consola
printAnalysisReport(analysis);

// Generar reporte completo
const report = generateReport(results, analysis);

// Mostrar reporte
printReport(report);

// Guardar reporte (optional)
// saveReport(report, './backtest-report.txt');

// Final summary
console.log("\n" + "=".repeat(60));
console.log("🎉 BACKTEST COMPLETADO");
console.log("=".repeat(60));
console.log(`Escenarios ejecutados: ${Object.keys(results).length}`);
console.log("Revisa el análisisabove para recomendaciones de estrategia.");