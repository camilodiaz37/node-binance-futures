# Research: Auto Stop-Loss, Take-Profit, and Trailing Stop

**Date**: 2026-03-19

## Findings

### 1. Binance OCO Orders

**Decision**: Use OCO (One-Cancels-Other) orders to place both stop-loss and take-profit

**Rationale**:
- Single API call places both orders atomically
- If one triggers, the other is automatically cancelled
- Reduces complexity vs sequential order placement
- Already supported by Binance Futures API

**API Endpoint**: `POST /fapi/v1/order/oco`

**Required Parameters**:
- `symbol`: Trading pair
- `side`: BUY or SELL
- `quantity`: Order quantity
- `stopPrice`: Price for stop orders
- `stopLimitPrice`: Limit price for stop orders
- `stopTimeInForce`: GTC (Good-Till-Cancel)
- `listClientOrderId`: Unique ID for OCO group

**Note**: OCO orders require LIMIT orders, not MARKET orders for the stop portion.

### 2. Trailing Stop Implementation

**Decision**: Use Binance's native TRAILING_STOP_MARKET algorithm order type

**Rationale**:
- Server-side execution - works even if bot is down
- More reliable than manual trailing stop implementation
- Already supported in existing binance-futures.ts `placeTrailingStopOrder()` method

**API Endpoint**: `POST /fapi/v1/algoOrder`

**Parameters**:
- `symbol`: Trading pair
- `side`: BUY or SELL
- `positionSide`: LONG or SHORT or BOTH
- `orderType`: TRAILING_STOP_MARKET
- `quantity`: Order quantity
- `callbackRate`: Percentage for trailing (e.g., 0.1 = 0.1%)

**Current Implementation**: There's already a placeholder at line 186-190 in binance-futures.ts with hardcoded 0.1% callbackRate - needs to be configurable.

### 3. Current Code Analysis

**Existing functionality**:
- `trade-executor.ts`: Calculates stopLoss and takeProfit prices correctly
- `order-service.ts:createOrder()`: Receives stopLoss/takeProfit but doesn't send to Binance
- `binance-futures.ts`: Has `placeStopLossOrder()`, `placeTakeProfitOrder()`, and `placeTrailingStopOrder()` methods - but they're NOT being called
- `config/index.ts`: Has stopLossPercent and takeProfitPercent - needs trailing stop config

## Alternatives Considered

1. **Manual SL/TP monitoring**: Instead of sending orders to Binance, monitor price in bot and close positions manually
   - Rejected: Requires bot to always be running, higher latency, risk of missing price targets

2. **Only stop-loss (no take-profit)**: Simpler but loses the main benefit of take-profit
   - Rejected: Both SL and TP are in the requirements

3. **Trailing stop via OCO with dynamic updates**: Update OCO order as price moves
   - Rejected: OCO orders are static; trailing stop needs native Binance support

## Implementation Notes

1. OCO orders need LIMIT orders (not MARKET) for the stop portion
2. Need to add TRAILING_STOP_PERCENT and TRAILING_STOP_ENABLED to config
3. The hardcoded callbackRate in binance-futures.ts line 188 needs to be made configurable
4. After placing market entry order, need to wait for order to fill before placing OCO orders