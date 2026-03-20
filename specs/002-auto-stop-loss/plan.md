# Implementation Plan: Auto Stop-Loss, Take-Profit, and Trailing Stop

**Branch**: `002-auto-stop-loss` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-auto-stop-loss/spec.md`

## Summary

Implement automatic stop-loss and take-profit order placement on Binance Futures, plus trailing stop configuration. The existing code calculates SL/TP values but does NOT send them to Binance - they are only tracked internally. This creates a critical gap where positions cannot be automatically closed by Binance when price targets are hit.

## Technical Context

**Language/Version**: TypeScript 5.6+, Node.js 18+
**Primary Dependencies**: Binance Futures API, dotenv
**Storage**: In-memory (orders), environment variables (config)
**Testing**: Manual testing with Binance testnet
**Target Platform**: Linux server (trading bot)
**Project Type**: CLI trading bot
**Performance Goals**: Real-time order execution (<1s latency)
**Constraints**: Must handle Binance API rate limits
**Scale/Scope**: Single-user trading bot, ~10-50 positions/day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution rules defined in project - proceeding with standard implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-auto-stop-loss/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if needed)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── config/index.ts          # Add trailing stop config
├── services/
│   ├── binance-futures.ts   # Already has SL/TP order methods
│   └── order-service.ts     # MODIFY: Send SL/TP to Binance
├── types/
│   └── strategy.ts          # Add trailing stop types
└── bot.ts                   # Track trailing stop state

tests/
├── unit/                    # Add SL/TP calculation tests
└── integration/             # Add order placement tests
```

**Structure Decision**: Single project - existing structure is adequate. Only modify existing files and add tests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Phase 0: Research

### Known Gaps Identified

1. **Gap**: SL/TP values calculated in `trade-executor.ts` but NOT sent to Binance order
2. **Gap**: No OCO (One-Cancels-Other) orders being placed
3. **Gap**: Trailing stop not implemented
4. **Gap**: `order-service.ts:createOrder()` receives stopLoss/takeProfit but doesn't use them

### Research Tasks

- [ ] Verify Binance OCO order API format for simultaneous SL/TP
- [ ] Verify trailing stop market order API format
- [ ] Research callbackRate parameter for trailing stop

## Phase 1: Design

### Data Model Updates

**New fields in RiskConfig**:
- `trailingStopPercent: number` - Percentage from peak price to trigger trailing stop
- `trailingStopEnabled: boolean` - Enable/disable trailing stop

**Updated entities**:
- `ManagedOrder` - Already has stopLoss, takeProfit - ensure they're sent to Binance

### Implementation Approach

1. **Option A**: Use OCO (One-Cancels-Other) orders - Single API call places both SL and TP
2. **Option B**: Place market order + separate stop-loss/take-profit orders sequentially

**Recommendation**: Option A - cleaner, atomic, both orders either succeed or fail together

### Contracts

- Binance Futures OCO endpoint: `/fapi/v1/order/oco`
- Trailing stop endpoint: `/fapi/v1/algoOrder` with `TRAILING_STOP_MARKET` type

## Next Steps

- Run `/speckit.tasks` to generate task list
- Begin Phase 1 implementation after tasks are approved