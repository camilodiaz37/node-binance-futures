# Research: Backtesting with 40 Real Market Scenarios

**Date**: 2026-03-20

## Findings

### Current Implementation

- Existing backtesting in `src/backtesting/` has 4-5 hardcoded scenarios
- `runBacktest()` processes a single scenario with full trade simulation
- `runAllBacktests()` loops through all scenarios
- Results track: trades, pnl, winRate, totalTrades, winningTrades, losingTrades
- Uses RSI, MACD, SMA indicators for signal generation

### Scenario Expansion Strategy

**Decision**: Generate 40 distinct scenarios programmatically

**Rationale**:
- Hardcoding 40 scenarios would be verbose and hard to maintain
- Programmatic generation allows for variations and easier expansion
- Each scenario represents a realistic market condition based on BTCUSDT patterns

### Scenario Categories (40 total)

| Category | Count | Description |
|----------|-------|-------------|
| Bullish volatile | 5 | Uptrend with high volatility, multiple pullbacks |
| Bearish volatile | 5 | Downtrend with high volatility, bounce attempts |
| Sideways/ranging | 10 | Price oscillating in a range, no clear trend |
| Trend reversal | 10 | Trend changing from bullish to bearish or vice versa |
| Flash crash | 5 | Sharp sudden drop followed by recovery |
| Parabolic move | 5 | Extremely strong trend in one direction |

### Analysis Metrics

**Decision**: Calculate comprehensive analysis metrics

**Metrics to implement**:
1. Win rate by market condition (trending bullish, bearish, ranging)
2. Average profit per winning trade
3. Average loss per losing trade
4. Profit factor (gross profit / gross loss)
5. Percentage of trades stopped out by SL
6. Percentage of trades stopped out by TP

### Recommendations Logic

**Decision**: Generate automated recommendations based on patterns

**Rules for recommendations**:
- If win rate < 40%: Recommend adjusting entry signals
- If profit factor < 1.5: Recommend adjusting SL/TP ratios
- If SL triggered > 60%: Recommend widening stop-loss
- If TP triggered < 30%: Recommend tightening take-profit
- If average loss > average win: Recommend 2:1 risk-reward minimum

## Alternatives Considered

1. **Manual 40 hardcoded scenarios**: Rejected - too verbose, hard to maintain
2. **Random walk generation**: Rejected - doesn't represent realistic market conditions
3. **Historical data download**: Rejected - requires external API, adds complexity

## Implementation Notes

- Existing backtest engine can be extended with new analysis functions
- Scenario generator function should accept seed for reproducibility
- Results should be cached for analysis phase