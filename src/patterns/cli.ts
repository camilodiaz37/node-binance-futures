#!/usr/bin/env node

/**
 * Pattern Detection CLI
 *
 * Usage:
 *   npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json
 *   npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json --types candles
 *   npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json --types all
 */
import * as fs from 'fs';
import * as path from 'path';
import { loadOHLCVFromFile } from './utils/data-loader';
import { detectAllCandlePatterns } from './candles';
import { formatPatterns, formatPatternSummary, formatPatternsAsJson } from './utils/formatter';
import { Pattern } from './types';

interface CLIArgs {
  command: string;
  file?: string;
  types?: string;
  output?: string;
  help?: boolean;
}

function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {
    command: args[0] || 'detect',
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--file' && args[i + 1]) {
      result.file = args[i + 1];
      i++;
    } else if (arg === '--types' && args[i + 1]) {
      result.types = args[i + 1];
      i++;
    } else if (arg === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    }
  }

  return result;
}

function printHelp() {
  console.log(`
Pattern Detection CLI

Usage:
  npx ts-node src/patterns/cli.ts detect --file <path> [options]

Options:
  --file <path>       Path to OHLCV JSON file (required)
  --types <type>      Pattern types to detect: candles, charts, all (default: all)
  --output <path>     Save results to JSON file
  --help, -h          Show this help message

Examples:
  npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json
  npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json --output results.json

Supported Patterns:
  - MORNING_STAR (bullish reversal)
  - EVENING_STAR (bearish reversal)
  - BULLISH_ENGULFING (bullish reversal)
  - BEARISH_ENGULFING (bearish reversal)
  - THREE_WHITE_SOLDIERS (bullish continuation)
  - THREE_BLACK_CROWS (bearish continuation)
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.file) {
    console.error('Error: --file is required');
    printHelp();
    process.exit(1);
  }

  const filePath = path.resolve(args.file);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Loading data from: ${filePath}`);

  try {
    const data = loadOHLCVFromFile(filePath);
    console.log(`Loaded ${data.length} candles`);

    if (data.length < 3) {
      console.error('Error: Need at least 3 candles for pattern detection');
      process.exit(1);
    }

    // Detect patterns based on type
    const types = args.types || 'all';

    console.log(`Detecting ${types} patterns...`);

    let patterns: Pattern[] = [];

    if (types === 'candles' || types === 'all') {
      patterns = detectAllCandlePatterns(data);
    } else if (types === 'charts') {
      // Charts not implemented yet
      console.log('Chart pattern detection not yet implemented');
      patterns = [];
    } else {
      console.error(`Unknown pattern type: ${types}`);
      process.exit(1);
    }

    // Output results
    console.log('\n' + formatPatterns(patterns));
    console.log('\n' + formatPatternSummary(patterns));

    // Save to file if requested
    if (args.output) {
      const outputPath = path.resolve(args.output);
      const outputDir = path.dirname(outputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, formatPatternsAsJson(patterns));
      console.log(`\nResults saved to: ${outputPath}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();