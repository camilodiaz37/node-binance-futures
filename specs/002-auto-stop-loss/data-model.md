# Data Model: Auto Stop-Loss, Take-Profit, and Trailing Stop

## Config Updates

### RiskConfig (existing + new fields)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `stopLossPercent` | number | Yes | 2 | Stop-loss percentage from entry |
| `takeProfitPercent` | number | Yes | 4 | Take-profit percentage from entry |
| `trailingStopPercent` | number | No | 2 | Trailing stop percentage from peak |
| `trailingStopEnabled` | boolean | No | false | Enable trailing stop |

## ManagedOrder (existing fields - ensure they are used)

| Field | Type | Description |
|-------|------|-------------|
| `stopLoss` | number \| null | Stop-loss price (SHOULD BE SENT TO BINANCE) |
| `takeProfit` | number \| null | Take-profit price (SHOULD BE SENT TO BINANCE) |
| `trailingStopPrice` | number \| null | Current trailing stop trigger price |

## Validation Rules

1. `stopLossPercent` must be > 0 and < 100
2. `takeProfitPercent` must be > 0 and < 100
3. `trailingStopPercent` must be > 0 and < 100 (when enabled)
4. For LONG: stopLoss < entry < takeProfit
5. For SHORT: takeProfit < entry < stopLoss

## State Transitions

```
OPEN → CLOSED (via stopLoss, takeProfit, trailingStop, or manual)
```

## Relationships

- RiskConfig → Used by order-service when creating orders
- ManagedOrder → Contains SL/TP values that must be sent to Binance
- Binance Order → External representation of SL/TP on Binance platform