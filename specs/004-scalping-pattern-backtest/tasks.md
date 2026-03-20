# Tasks: Sistema de Reconocimiento de Patrones de Scalping con Backtesting

**Feature**: 004-scalping-pattern-backtest
**Branch**: 004-scalping-pattern-backtest
**Spec**: [spec.md](./spec.md)

## Implementation Strategy

MVP scope: User Story 1 (Detección de Patrones de Velas) - Este story es suficiente como MVP porque proporciona la funcionalidad básica de detección de patrones.

Entrega incremental: Cada user story es un incremento independiente y testeable.

## Dependencies Graph

```
Phase 1: Setup
    ↓
Phase 2: Foundational (OHLCV types, data loading)
    ↓
    ├─→ Phase 3: US1 - Detección de Patrones de Velas
    ├─→ Phase 4: US2 - Detección de Patrones de Gráficos
    ├─→ Phase 5: US3 - Backtesting de Patrones
    ├─→ Phase 6: US4 - Optimización de Parámetros
    └─→ Phase 7: US5 - Análisis de Sensibilidad
    ↓
Phase 8: Polish
```

## Phase 1: Setup

- [X] T001 Create project structure for patterns module in src/patterns/
- [X] T002 [P] Create candles/ directory in src/patterns/candles/
- [X] T003 [P] Create charts/ directory in src/patterns/charts/
- [X] T004 Create data/historical/ directory for OHLCV data storage
- [X] T005 Create data/results/ directory for backtest results storage

## Phase 2: Foundational

**Goal**: Create shared types and utilities needed by all user stories

**Independent Test**: All foundational code compiles and basic validation works

- [X] T006 Define OHLCV interface type in src/patterns/types.ts
- [X] T007 Define PatternType and PatternDirection types in src/patterns/types.ts
- [X] T008 Define Pattern interface with all fields in src/patterns/types.ts
- [X] T009 Create OHLCV validation function in src/patterns/utils/validation.ts
- [X] T010 Create data loader utility in src/patterns/utils/data-loader.ts to read JSON OHLCV files
- [X] T011 Create output formatter utility in src/patterns/utils/formatter.ts

## Phase 3: User Story 1 - Detección de Patrones de Velas

**Goal**: Detect candle patterns (Morning Star, Evening Star, Engulfing, Tres Soldados, Tres Cuervos)

**Independent Test**: Analyze historical candle data and output all detected patterns with timestamps

### Task Implementation

- [X] T012 [P] [US1] Create Morning Star detector in src/patterns/candles/morning-star.ts
- [X] T013 [P] [US1] Create Evening Star detector in src/patterns/candles/evening-star.ts
- [X] T014 [P] [US1] Create Engulfing detector in src/patterns/candles/engulfing.ts
- [X] T015 [P] [US1] Create Three White Soldiers detector in src/patterns/candles/three-white-soldiers.ts
- [X] T016 [P] [US1] Create Three Black Crows detector in src/patterns/candles/three-black-crows.ts
- [X] T017 [US1] Create unified candle pattern detector in src/patterns/candles/index.ts
- [X] T018 [US1] Create CLI entry point in src/patterns/cli.ts for pattern detection
- [X] T019 [US1] Add command to detect all patterns from JSON file

### Tests

- [X] T020 [US1] Write unit tests for Morning Star detector in tests/patterns/candles/morning-star.test.ts
- [X] T021 [US1] Write unit tests for Evening Star detector in tests/patterns/candles/evening-star.test.ts
- [X] T022 [US1] Write unit tests for Engulfing detector in tests/patterns/candles/engulfing.test.ts
- [X] T023 [US1] Write unit tests for Three White Soldiers detector in tests/patterns/candles/three-white-soldiers.test.ts
- [X] T024 [US1] Write unit tests for Three Black Crows detector in tests/patterns/candles/three-black-crows.test.ts

**Acceptance Criteria**:
- Detecta Morning Star con dirección ALCISTA cuando se cumplen criterios
- Detecta Evening Star con dirección BAJISTA cuando se cumplen criterios
- Detecta Engulfing Alcista y Bajista correctamente
- Detecta Tres Soldados Blancos y Tres Cuervos Negros
- Sistema puede analizar archivo JSON y outputting lista de patrones encontrados

## Phase 4: User Story 2 - Detección de Patrones de Gráficos

**Goal**: Detect chart patterns (Rectangles, Flags) for breakout detection

**Independent Test**: Analyze price data and detect consolidation patterns with support/resistance levels

### Task Implementation

- [ ] T025 [P] [US2] Create swing point detection utility in src/patterns/charts/utils/swing-points.ts
- [ ] T026 [P] [US2] Create support/resistance level detector in src/patterns/charts/utils/support-resistance.ts
- [ ] T027 [US2] Create Rectangle detector in src/patterns/charts/rectangle.ts
- [ ] T028 [US2] Create Flag detector in src/patterns/charts/flag.ts
- [ ] T029 [US2] Create unified chart pattern detector in src/patterns/charts/index.ts
- [ ] T030 [US2] Update CLI to support chart pattern detection

### Tests

- [ ] T031 [US2] Write unit tests for Rectangle detector in tests/patterns/charts/rectangle.test.ts
- [ ] T032 [US2] Write unit tests for Flag detector in tests/patterns/charts/flag.test.ts

**Acceptance Criteria**:
- Detecta ruptura de resistencia en rectángulo alcista
- Detecta ruptura de soporte en rectángulo bajista
- Detecta Banderín Alcista después de movimiento significativo
- Detecta Banderín Bajista después de movimiento significativo

## Phase 5: User Story 3 - Backtesting de Patrones

**Goal**: Execute backtests against historical data and generate performance reports

**Independent Test**: Run backtest on historical data and output trade metrics (wins, losses, winrate, profit factor)

### Task Implementation

- [ ] T033 Define BacktestParams interface in src/backtesting/types.ts
- [ ] T034 Define BacktestResult interface in src/backtesting/types.ts
- [ ] T035 [P] [US3] Create trade simulation engine in src/backtesting/simulator.ts
- [ ] T036 [US3] Integrate pattern detection with backtest simulator
- [ ] T037 [US3] Add backtest CLI command in src/backtesting/cli.ts
- [ ] T038 [US3] Add pattern ranking by winrate output

### Tests

- [ ] T039 [US3] Write integration tests for backtest simulator in tests/backtesting/simulator.test.ts

**Acceptance Criteria**:
- Backtest reporta: total operaciones, ganadas, perdidas, winrate, profit factor
- Genera ranking de patrones por winrate
- Maneja datos con gaps omitiendo períodos afectados

## Phase 6: User Story 4 - Optimización de Parámetros

**Goal**: Generate multiple parameter variants and find best winrate configuration

**Independent Test**: Run optimization and output top 10 configurations by winrate

### Task Implementation

- [ ] T040 Define OptimizationResult interface in src/backtesting/types.ts
- [ ] T041 [P] [US4] Create parameter variant generator in src/backtesting/optimizer/params-generator.ts
- [ ] T042 [US4] Create grid search executor in src/backtesting/optimizer/grid-search.ts
- [ ] T043 [US4] Create configuration ranker in src/backtesting/optimizer/ranker.ts
- [ ] T044 [US4] Create main optimizer module in src/backtesting/optimizer/index.ts
- [ ] T045 [US4] Add optimization CLI command in src/backtesting/cli.ts

### Tests

- [ ] T046 [US4] Write tests for parameter generator in tests/backtesting/optimizer/params-generator.test.ts

**Acceptance Criteria**:
- Genera mínimo 50 variantes de parámetros por patrón
- Excluye configuraciones con menos de 30 operaciones del ranking
- Reporta las 10 mejores combinaciones por winrate
- Indica mejor timeframe para cada patrón

## Phase 7: User Story 5 - Análisis de Sensibilidad y Robustez

**Goal**: Validate that results are robust and not overfitted

**Independent Test**: Compare training/test results and report overfitting detection

### Task Implementation

- [ ] T047 Create train/test split utility in src/backtesting/optimizer/split-data.ts
- [ ] T048 [US5] Create overfitting detection in src/backtesting/optimizer/overfitting-detector.ts
- [ ] T049 [US5] Create sensitivity analysis in src/backtesting/optimizer/sensitivity-analyzer.ts
- [ ] T050 [US5] Add validation CLI command in src/backtesting/cli.ts

### Tests

- [ ] T051 [US5] Write tests for overfitting detection in tests/backtesting/optimizer/overfitting.test.ts

**Acceptance Criteria**:
- Reporta diferencia de winrate entre entrenamiento y prueba
- Marca overfitting cuando diferencia >10%
- Reporta cuánto baja winrate al variar ±20% parámetros

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final integration, documentation, and cleanup

- [ ] T052 Update package.json scripts for all new CLI commands
- [ ] T053 Add comprehensive README.md for pattern detection usage
- [ ] T054 Add sample data file in data/historical/sample.json for testing
- [ ] T055 Run full integration test with sample data
- [ ] T056 Verify all tests pass with npm test

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 56 |
| Phase 1 (Setup) | 5 |
| Phase 2 (Foundational) | 6 |
| Phase 3 (US1 - Candle Patterns) | 13 |
| Phase 4 (US2 - Chart Patterns) | 8 |
| Phase 5 (US3 - Backtesting) | 7 |
| Phase 6 (US4 - Optimization) | 7 |
| Phase 7 (US5 - Robustness) | 5 |
| Phase 8 (Polish) | 5 |

## Parallel Opportunities

- **T002-T003**: Can run in parallel (create candles/ and charts/ directories)
- **T012-T016**: All candle detectors can be developed in parallel
- **T025-T026**: Swing point and support/resistance utilities can be parallel
- **T041-T043**: Optimization components can be parallel
- **T020-T024**: All candle pattern tests can run in parallel

## Independent Test Criteria

| User Story | Test Criteria |
|------------|---------------|
| US1 | Sistema analiza datos de velas y reporta todos los patrones definidos con timestamps |
| US2 | Sistema analiza datos de precios y detecta consolidación con niveles de SR |
| US3 | Sistema ejecuta backtest y reporta métricas completas por patrón |
| US4 | Sistema genera tabla comparativa de 50+ variantes con top 10 por winrate |
| US5 | Sistema reporta diferencia de winrate y detecta overfitting >10% |

## MVP Scope

**MVP = Phase 3 completo (US1)**
- Detección de 5 patrones de velas
- CLI funcional para detección
- Tests unitarios para cada detector
- Output en formato JSON con patrones encontrados