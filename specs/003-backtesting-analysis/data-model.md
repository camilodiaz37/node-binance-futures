# Data Model: Backtesting with 40 Real Market Scenarios

## Existing Types (Extended)

### BacktestResult (existing)

| Field | Type | Description |
|-------|------|-------------|
| trades | TradeResult[] | Array of executed trades |
| pnl | number | Total profit/loss |
| winRate | number | Percentage of winning trades |
| totalTrades | number | Total number of trades |
| winningTrades | number | Count of winning trades |
| losingTrades | number | Count of losing trades |

### TradeResult (existing)

| Field | Type | Description |
|-------|------|-------------|
| entryPrice | number | Price at trade entry |
| exitPrice | number | Price at trade exit |
| side | "BUY" \| "SELL" | Trade direction |
| pnl | number | Profit/loss for this trade |
| exitReason | "STOP_LOSS" \| "TAKE_PROFIT" | Why trade was closed |

## New Types

### AnalysisReport (NEW)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| totalScenarios | number | Yes | Number of scenarios tested (40) |
| totalTrades | number | Yes | Aggregate trades across all scenarios |
| overallWinRate | number | Yes | Win rate as percentage (0-100) |
| profitFactor | number | Yes | Gross profit / gross loss |
| averageWin | number | Yes | Average profit per winning trade |
| averageLoss | number | Yes | Average loss per losing trade |
| slTriggeredPercent | number | Yes | % of trades closed by stop-loss |
| tpTriggeredPercent | number | Yes | % of trades closed by take-profit |
| winRateByCondition | Record<string, number> | Yes | Win rate broken down by market type |
| recommendations | string[] | Yes | Array of improvement recommendations |

### MarketCondition (NEW)

Type alias: `"BULLISH_VOLATILE" | "BEARISH_VOLATILE" | "SIDEWAYS" | "TREND_REVERSAL" | "FLASH_CRASH" | "PARABOLIC"`

## Validation Rules

1. Each scenario must have at least 20 price points
2. AnalysisReport.profitFactor must be calculated only if grossLoss > 0
3. Recommendations must not be empty if totalTrades > 0

## State Transitions

```
Scenario Selection → Backtest Execution → Results Collection → Analysis → Report Generation
```