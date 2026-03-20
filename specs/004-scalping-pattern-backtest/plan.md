# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Sistema de reconocimiento de patrones de scalping que detecta patrones de velas (Morning Star, Evening Star, Engulfing, Tres Soldados, Tres Cuervos) y gráficos (Rectángulos, Banderas), ejecuta backtests históricos y optimiza parámetros para maximizar winrate.

## Technical Context

**Language/Version**: TypeScript 5.6+, Node.js 18+
**Primary Dependencies**: axios (Binance API), archivos JSON (datos históricos)
**Storage**: Archivos locales para datos históricos y resultados de backtest
**Testing**: jest (framework de testing existente del proyecto)
**Target Platform**: Linux server (bot de trading)
**Project Type**: CLI/Tool de análisis de trading
**Performance Goals**: Backtest de 50+ variantes por patrón en <5 minutos
**Constraints**: Datos históricos mínimos de 30 días, spread del broker no incluido en simulación
**Scale/Scope**: Múltiples timeframes (1m, 5m, 15m), 6+ tipos de patrones

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Technology Stack (Node.js + TypeScript + axios) | ✅ PASS | Cumple con constitución: usar Node, TypeScript y axios |
| API Binance | ✅ PASS | Integración con API REST de Binance existente |
| Independiente del frontend | ✅ PASS | CLI tool, no requiere UI |
| Testing disponible | ✅ PASS | Proyecto tiene jest configurado |

## Project Structure

### Documentation (this feature)

```text
specs/004-scalping-pattern-backtest/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A para esta feature
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── patterns/            # NEW: Módulos de detección de patrones
│   ├── candles/        # Patrones de velas
│   └── charts/         # Patrones de gráficos
├── backtesting/        # EXISTING: Motor de backtesting
│   ├── engine.ts       # Motor existente
│   ├── scenarios.ts   # Escenarios existentes
│   └── optimizer.ts   # NEW: Optimizador de parámetros
├── services/           # EXISTING: Servicios del proyecto
└── ...

data/
├── historical/         # NEW: Datos históricos OHLCV
└── results/            # NEW: Resultados de backtest

tests/
├── patterns/           # NEW: Tests de detección de patrones
└── ...
```

**Structure Decision**: Los nuevos módulos de patrones se agregan en `src/patterns/`, el optimizador extiende `src/backtesting/`. Datos históricos almacenados en `data/historical` en formato JSON.

## Phase 1: Design Complete

**Research completed**: ✅
- Pattern detection algorithms: implementation rule-based confirmed
- Backtesting approach: extend existing engine
- Optimization method: grid search with hold-out validation

**Data model completed**: ✅
- OHLCV entity with validation
- Pattern entity for detection results
- BacktestParams, BacktestResult, OptimizationResult

**Quickstart completed**: ✅
- CLI commands for detect, backtest, optimize, validate
- Data input format (JSON OHLCV)
- Output format documentation

**Agent context updated**: ✅
- Added TypeScript 5.6+, Node.js 18+ to CLAUDE.md
- Added axios for Binance API
- Added local files for historical data

## Constitution Check (Post-Design)

| Gate | Status | Notes |
|------|--------|-------|
| Technology Stack (Node.js + TypeScript + axios) | ✅ PASS | Confirmado |
| API Binance | ✅ PASS | Sin cambios |
| Independiente del frontend | ✅ PASS | Confirmado |
| Testing disponible | ✅ PASS | jest existente |

## Complexity Tracking

No violations detected. Estructura simple con extensiones al código existente.
