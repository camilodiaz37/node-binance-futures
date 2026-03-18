import { runBacktest, runAllBacktests, printResults } from "./engine";

/**
 * Backtesting CLI
 * Ejecutar: npm run backtest
 */

console.log("\n🧪 BACKTESTING - Estrategia Bollinger Bands + RSI\n");

// Ejecutar todos los escenarios
const results = runAllBacktests();

// Resumen general
console.log("\n" + "=".repeat(60));
console.log("📈 RESUMEN GENERAL");
console.log("=".repeat(60));

let totalTrades = 0;
let totalWins = 0;
let totalNetProfit = 0;

for (const [scenario, result] of Object.entries(results)) {
  printResults(scenario, result);
  totalTrades += result.totalTrades;
  totalWins += result.winningTrades;
  totalNetProfit += result.netProfit;
}

console.log("\n" + "=".repeat(60));
console.log("📊 ESTADÍSTICAS GLOBALES");
console.log("=".repeat(60));
console.log(`Total operaciones: ${totalTrades}`);
console.log(`Profit neto total: $${totalNetProfit.toFixed(2)}`);
console.log(`Escenarios probados: ${Object.keys(results).length}`);