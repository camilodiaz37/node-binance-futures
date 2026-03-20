# Tasks: Auto Stop-Loss, Take-Profit, and Trailing Stop

**Feature**: 002-auto-stop-loss
**Generated**: 2026-03-19

## Dependencies

```
US1 (SL/TP Placement) ─┬─► US2 (Trailing Stop)
                       └─► US3 (Configurable Params)

All phases depend on Phase 1 (Setup) and Phase 2 (Foundational)
```

## Phase 1: Setup

- [X] T001 Add trailing stop configuration to src/config/index.ts
- [X] T002 Add trailingStopPercent and trailingStopEnabled types to src/types/strategy.ts
- [X] T003 Add TRAILING_STOP_PERCENT and TRAILING_STOP_ENABLED to .env.example

## Phase 2: Foundational

- [X] T004 [P] Add OCO (One-Cancels-Other) order method to src/services/binance-futures.ts
- [X] T005 [P] Make trailing stop callbackRate configurable in src/services/binance-futures.ts

## Phase 3: US1 - Stop-Loss and Take-Profit Placement (P1)

**Goal**: Automatically place OCO orders with stop-loss and take-profit when opening positions

**Independent Test**: Place test order and verify OCO order appears in Binance with correct SL/TP prices

**Implementation**:

- [X] T006 [US1] Modify src/services/order-service.ts to place OCO order after market entry fills
- [X] T007 [US1] Add validation: ensure stopLoss < entry < takeProfit for LONG positions
- [X] T008 [US1] Add validation: ensure takeProfit < entry < stopLoss for SHORT positions
- [X] T009 [US1] Handle OCO order placement errors gracefully in src/services/order-service.ts

## Phase 4: US2 - Trailing Stop Configuration (P2)

**Goal**: Enable trailing stop to follow price and protect profits

**Independent Test**: Simulate price movement and verify trailing stop order is placed with correct callback rate

**Implementation**:

- [X] T010 [P] [US2] Add trailing stop order placement after market entry in src/services/order-service.ts
- [X] T011 [P] [US2] Implement trailing stop update logic when price moves favorably
- [X] T012 [US2] Handle trailing stop trigger: close position when price retreats by callbackRate percentage

## Phase 5: US3 - Configurable Risk Parameters (P3)

**Goal**: Allow users to customize SL/TP/trailing stop via environment variables

**Independent Test**: Change env vars and verify bot uses new values

**Implementation**:

- [X] T013 [US3] Add config validation for trailingStopPercent (must be > 0 and < 100)
- [X] T014 [US3] Add config validation: warn if stopLossPercent > takeProfitPercent
- [X] T015 [US3] Add logging when risk parameters are loaded from config

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T016 Add comprehensive logging for SL/TP/trailing stop activations
- [X] T017 Add error handling for Binance API failures during order placement
- [X] T018 Verify existing tests pass with new changes

## Implementation Complete

All 18 tasks have been completed. The build compiles successfully.

### Summary of Changes

| File | Changes |
|------|---------|
| `src/config/index.ts` | Added trailingStopPercent, trailingStopEnabled, config validation, and logging |
| `src/types/strategy.ts` | Added trailingStopPercent and trailingStopEnabled to BotConfig |
| `src/services/binance-futures.ts` | Fixed placeOrder, added placeOcoOrder and placeTrailingStopOrder methods |
| `src/services/order-service.ts` | Added OCO order placement, trailing stop tracking, comprehensive logging |
| `.env.example` | Added all new environment variables |