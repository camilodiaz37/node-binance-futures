# Quickstart: Backtesting with 40 Real Market Scenarios

## Running the Backtest

```bash
# Run all 40 scenarios with default settings
npm run backtest

# Run specific number of random scenarios (e.g., 20)
# (Future: npm run backtest -- --count 20)

# Run with specific seed for reproducible results
# (Future: npm run backtest -- --seed 12345)
```

## Output

The backtest will output:

1. **Individual Scenario Results**: Each of the 40 scenarios shows:
   - Total trades executed
   - Win rate
   - PnL (profit/loss)

2. **Aggregate Results**: Summary across all scenarios:
   - Total trades
   - Overall win rate
   - Profit factor
   - Average win/loss

3. **Analysis Report**: Key insights:
   - Win rate by market condition
   - SL/TP trigger percentages
   - Recommendations for strategy improvement

## Example Output

```
📊 BACKTEST RESULTS - 40 Scenarios
=====================================
Total Trades: 156
Win Rate: 58.3%
Profit Factor: 2.14
Avg Win: $124.50
Avg Loss: -$58.20

📈 PERFORMANCE BY CONDITION
----------------------------
Bullish: 62% win rate
Bearish: 55% win rate
Sideways: 45% win rate

💡 RECOMMENDATIONS
-------------------
1. Consider widening stop-loss in sideways markets
2. Strategy performs best in trending markets
3. Average win/loss ratio is good (2.14:1)
```

## Configuration

Edit `.env` to adjust backtest parameters:

```bash
STOP_LOSS_PERCENT=2
TAKE_PROFIT_PERCENT=4
```

These values are used for all 40 scenario backtests.