# Implementation Plan: Backtesting with 40 Real Market Scenarios

**Branch**: `003-backtesting-analysis` | **Date**: 2026-03-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-backtesting-analysis/spec.md`

## Summary

Expand the existing backtesting system to support 40 unique market scenarios, execute comprehensive backtests on all scenarios, and provide detailed analysis with recommendations for strategy improvement. The existing backtesting infrastructure has 4-5 hardcoded scenarios that need to be expanded to 40 programmatically generated scenarios.

## Technical Context

**Language/Version**: TypeScript 5.6+, Node.js 18+
**Primary Dependencies**: Existing backtesting module (engine.ts, scenarios.ts)
**Storage**: In-memory for results, file-based for scenarios
**Testing**: Direct execution of backtesting module
**Target Platform**: CLI/Server
**Project Type**: Trading bot with backtesting capability
**Performance Goals**: Execute 40 backtests in under 10 seconds
**Constraints**: None identified
**Scale/Scope**: 40 scenarios, single execution run

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution rules defined in project - proceeding with standard implementation.

## Project Structure

### Documentation (this feature)

```text
specs/003-backtesting-analysis/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── backtesting/
│   ├── index.ts         # Entry point - add 40-scenario runner
│   ├── engine.ts        # Add analyzeResults function
│   ├── scenarios.ts     # EXPAND to 40 scenarios
│   └── types.ts         # Add AnalysisReport type
```

**Structure Decision**: Single project - existing structure is adequate. Only modify existing files in src/backtesting/.

## Phase 0: Research

### Known Implementation

- Existing scenarios are hardcoded in `scenarios.ts` (4-5 scenarios)
- `runBacktest()` executes a single scenario
- `runAllBacktests()` iterates over all scenarios
- Results include: trades, pnl, winRate, etc.

### Research Tasks

- [ ] Verify current backtest engine metrics calculation
- [ ] Identify all existing scenario patterns to expand from

## Phase 1: Design

### Data Model Updates

**New fields in BacktestResult** (existing):
- Already has: trades[], pnl, winRate, totalTrades, winningTrades, losingTrades

**New type: AnalysisReport**:
- winRateByCondition: Record<string, number>
- averageWin: number
- averageLoss: number
- profitFactor: number
- slTriggeredPercent: number
- tpTriggeredPercent: number
- recommendations: string[]

### Implementation Approach

1. **Scenario Generation**: Expand `scenarios.ts` with 40 distinct scenarios covering:
   - Bullish volatile (5 scenarios)
   - Bearish volatile (5 scenarios)
   - Sideways/ranging (10 scenarios)
   - Trend reversals (10 scenarios)
   - Flash crashes (5 scenarios)
   - Parabolic moves (5 scenarios)

2. **Random Selection**: Add function to randomly select 40 scenarios with seed option

3. **Analysis Engine**: Add `analyzeResults()` function to calculate:
   - Win rate by market condition
   - Average win/loss
   - SL/TP trigger percentages
   - Generate recommendations

## Next Steps

- Run `/speckit.tasks` to generate task list