/**
 * Output Formatter Utilities
 */
import { Pattern, BacktestResult, OptimizationResult, PatternType } from '../types';

/**
 * Formats a Pattern for console output
 */
export function formatPattern(pattern: Pattern): string {
  const date = new Date(pattern.timestamp).toISOString();
  return `[${date}] ${pattern.type} (${pattern.direction}) - Price: ${pattern.price.toFixed(2)} - Confidence: ${(pattern.confidence * 100).toFixed(1)}%`;
}

/**
 * Formats patterns array for console output
 */
export function formatPatterns(patterns: Pattern[]): string {
  if (patterns.length === 0) {
    return 'No patterns detected';
  }

  const lines = patterns.map(p => `  - ${formatPattern(p)}`);
  return `Found ${patterns.length} pattern(s):\n${lines.join('\n')}`;
}

/**
 * Formats BacktestResult for console output
 */
export function formatBacktestResult(result: BacktestResult): string {
  return `
Pattern: ${result.pattern}
Parameters: SL=${result.params.stopLossPercent}%, TP=${result.params.takeProfitPercent}%, TF=${result.params.timeframe}
-------------------------------------------
Total Trades: ${result.totalTrades}
Winners: ${result.winningTrades} | Losers: ${result.losingTrades}
Win Rate: ${(result.winRate * 100).toFixed(2)}%
Avg Win: ${result.averageWin.toFixed(2)}% | Avg Loss: ${result.averageLoss.toFixed(2)}%
Profit Factor: ${result.profitFactor.toFixed(2)}
Max Drawdown: ${result.maxDrawdown.toFixed(2)}%
Total P&L: ${result.totalPnL.toFixed(2)}%
`.trim();
}

/**
 * Formats OptimizationResult for console output
 */
export function formatOptimizationResult(result: OptimizationResult): string {
  const overfittingStatus = result.overfittingDetected ? '⚠️ OVERFITTING DETECTED' : '✅';

  let output = `
Optimization Results for ${result.pattern}
=========================================
Training Win Rate: ${(result.trainingWinRate * 100).toFixed(2)}%
Test Win Rate: ${(result.testWinRate * 100).toFixed(2)}%
${overfittingStatus}

Top 10 Configurations by Win Rate:
`;

  result.topConfigs.forEach((config, i) => {
    output += `
${i + 1}. Win Rate: ${(config.winRate * 100).toFixed(2)}% | Trades: ${config.totalTrades}
   SL: ${config.params.stopLossPercent}% | TP: ${config.params.takeProfitPercent}% | TF: ${config.params.timeframe}
   Profit Factor: ${config.profitFactor.toFixed(2)}
`;
  });

  return output.trim();
}

/**
 * Formats patterns as JSON for programmatic output
 */
export function formatPatternsAsJson(patterns: Pattern[]): string {
  return JSON.stringify(patterns, null, 2);
}

/**
 * Formats backtest results as JSON
 */
export function formatBacktestAsJson(result: BacktestResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Formats optimization result as JSON
 */
export function formatOptimizationAsJson(result: OptimizationResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Creates a summary table of pattern detection results
 */
export function createPatternSummary(patterns: Pattern[]): Record<string, number> {
  const summary: Record<string, number> = {};

  patterns.forEach(pattern => {
    const key = pattern.type;
    summary[key] = (summary[key] || 0) + 1;
  });

  return summary;
}

/**
 * Formats a pattern summary for console
 */
export function formatPatternSummary(patterns: Pattern[]): string {
  const summary = createPatternSummary(patterns);

  const lines = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `  ${type}: ${count}`);

  return `Pattern Summary:\n${lines.join('\n')}`;
}