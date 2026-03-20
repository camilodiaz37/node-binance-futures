---

description: "Task list for Backtesting with 40 Real Market Scenarios and Strategy Analysis"
---

# Tasks: Backtesting with 40 Real Market Scenarios and Strategy Analysis

**Input**: Design documents from `/specs/003-backtesting-analysis/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure already exists - validate existing code

- [ ] T001 Validate existing backtesting module in src/backtesting/engine.ts
- [ ] T002 Validate existing scenarios in src/backtesting/scenarios.ts
- [ ] T003 Check existing data types in src/backtesting/types.ts

**Checkpoint**: Validate existing implementation before expanding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and infrastructure needed before user story implementation

- [ ] T004 Define MarketCondition enum in src/backtesting/types.ts (trending_up, trending_down, ranging, high_volatility, low_volatility)
- [ ] T005 Define AnalysisReport interface in src/backtesting/types.ts
- [ ] T006 Extend BacktestResult to include scenario metadata in src/backtesting/types.ts
- [ ] T007 Add utility functions for scenario generation in src/backtesting/scenarioGenerator.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate 40 Random Real Market Scenarios (Priority: P1) 🎯 MVP

**Goal**: Generate 40 diverse market scenarios using real historical price patterns

**Independent Test**: Run backtest command and confirm 40 distinct scenarios with different market conditions

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create 10 trending-up scenarios in src/backtesting/scenarios.ts
- [ ] T009 [P] [US1] Create 10 trending-down scenarios in src/backtesting/scenarios.ts
- [ ] T010 [P] [US1] Create 10 ranging market scenarios in src/backtesting/scenarios.ts
- [ ] T011 [P] [US1] Create 5 high-volatility scenarios in src/backtesting/scenarios.ts
- [ ] T012 [P] [US1] Create 5 low-volatility scenarios in src/backtesting/scenarios.ts
- [ ] T013 [US1] Implement random scenario selector in src/backtesting/scenarioGenerator.ts
- [ ] T014 [US1] Implement runAllBacktests function in src/backtesting/engine.ts (depends on T008-T012)
- [ ] T015 [US1] Add scenario metadata (condition type) to each scenario in src/backtesting/scenarios.ts

**Checkpoint**: 40 scenarios with varied market conditions available

---

## Phase 4: User Story 2 - Execute Backtests and Collect Results (Priority: P1)

**Goal**: Execute trades on each scenario and collect performance metrics

**Independent Test**: Run backtests and verify aggregate metrics (total trades, win rate, PnL)

### Implementation for User Story 2

- [ ] T016 [P] [US2] Extend TradeResult to include exitReason in src/backtesting/types.ts
- [ ] T017 [P] [US2] Add marketCondition field to TradeResult in src/backtesting/types.ts
- [ ] T018 [US2] Update backtest execution to record exit reason (stop_loss, take_profit, signal_end) in src/backtesting/engine.ts
- [ ] T019 [US2] Implement aggregate metrics calculation in src/backtesting/engine.ts
- [ ] T020 [US2] Update runAllBacktests to collect per-scenario results in src/backtesting/engine.ts
- [ ] T021 [US2] Add profit factor calculation in src/backtesting/engine.ts
- [ ] T022 [US2] Add average win/loss calculations in src/backtesting/engine.ts

**Checkpoint**: All 40 scenarios executed with complete metrics

---

## Phase 5: User Story 3 - Analyze Results and Identify Strategy Improvements (Priority: P1)

**Goal**: Analyze backtest results to identify patterns, strengths, and weaknesses

**Independent Test**: Review analysis report with specific recommendations

### Implementation for User Story 3

- [ ] T023 [P] [US3] Implement win rate by market condition analysis in src/backtesting/analyzer.ts
- [ ] T024 [P] [US3] Implement average profit per winning trade calculation in src/backtesting/analyzer.ts
- [ ] T025 [P] [US3] Implement average loss per losing trade calculation in src/backtesting/analyzer.ts
- [ ] T026 [US3] Implement SL/TP trigger percentage analysis in src/backtesting/analyzer.ts
- [ ] T027 [US3] Implement strategy recommendation engine in src/backtesting/analyzer.ts
- [ ] T028 [US3] Create analyzeResults function in src/backtesting/analyzer.ts (depends on T023-T027)
- [ ] T029 [US3] Generate recommendations based on analysis in src/backtesting/analyzer.ts

**Checkpoint**: Analysis provides actionable insights for strategy improvement

---

## Phase 6: User Story 4 - Generate Comprehensive Report (Priority: P2)

**Goal**: Generate detailed report with visualizations and recommendations

**Independent Test**: Run report command and verify summary table with key metrics

### Implementation for User Story 4

- [ ] T030 [P] [US4] Implement summary table generator in src/backtesting/reporter.ts
- [ ] T031 [P] [US4] Implement recommendation formatter in src/backtesting/reporter.ts
- [ ] T032 [US4] Create generateReport function in src/backtesting/reporter.ts (depends on T030-T031)
- [ ] T033 [US4] Integrate analysis results into report output in src/backtesting/reporter.ts
- [ ] T034 [US4] Add configuration for STOP_LOSS_PERCENT and TAKE_PROFIT_PERCENT in src/backtesting/engine.ts

**Checkpoint**: Report generated with complete metrics and recommendations

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T035 [P] Run quickstart.md validation
- [ ] T036 Update README with backtesting documentation
- [ ] T037 Add error handling for edge cases (all losing trades, insufficient data, flat price)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - validate existing code first
- **Foundational (Phase 2)**: Depends on Setup - defines core types for all stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase
  - US1 and US2 are parallel (both use scenarios differently)
  - US3 depends on US2 (needs results to analyze)
  - US4 depends on US3 (needs analysis for report)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Generates data for US3
- **User Story 3 (P1)**: Depends on User Story 2 - Analyzes collected results
- **User Story 4 (P2)**: Depends on User Story 3 - Uses analysis for report

### Within Each User Story

- Core types before implementation
- Implementation before integration
- Story complete before moving to next

### Parallel Opportunities

- T008-T012: Create scenarios in parallel (different condition types)
- T016-T017: Extend types in parallel
- T023-T025: Analysis functions in parallel
- T030-T031: Reporter functions in parallel

---

## Parallel Example: User Story 1 & 2

```bash
# Launch all scenario creation tasks together:
Task: "Create 10 trending-up scenarios in src/backtesting/scenarios.ts"
Task: "Create 10 trending-down scenarios in src/backtesting/scenarios.ts"
Task: "Create 10 ranging market scenarios in src/backtesting/scenarios.ts"
Task: "Create 5 high-volatility scenarios in src/backtesting/scenarios.ts"
Task: "Create 5 low-volatility scenarios in src/backtesting/scenarios.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Generate scenarios)
4. Complete Phase 4: User Story 2 (Execute backtests)
5. **STOP and VALIDATE**: Test execution with 40 scenarios
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → 40 scenarios available
3. Add User Story 2 → Execute and collect results
4. Add User Story 3 → Analyze results
5. Add User Story 4 → Generate comprehensive report
6. Each story adds value without breaking previous stories

### After All Stories Complete

Polish phase addresses:
- Edge case handling
- Documentation updates
- Quickstart validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- US1 and US2 are MVP (P1), US3 builds on US2, US4 is P2
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently