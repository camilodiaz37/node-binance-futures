# Quickstart: Auto Stop-Loss, Take-Profit, and Trailing Stop

## New Environment Variables

Add to your `.env` file:

```bash
# Risk Management (existing)
STOP_LOSS_PERCENT=2
TAKE_PROFIT_PERCENT=4

# Trailing Stop (NEW)
TRAILING_STOP_ENABLED=false
TRAILING_STOP_PERCENT=2
```

## Behavior

### Stop-Loss and Take-Profit

When a position is opened:
1. Market entry order is placed
2. OCO (One-Cancels-Other) order is placed with:
   - Stop-loss order at configured percentage
   - Take-profit order at configured percentage
3. When either triggers, the other is automatically cancelled

### Trailing Stop

When enabled:
1. After entry order fills, a trailing stop order is placed
2. As price moves favorably, the stop level follows
3. When price reverses by the callback rate, position closes

## Testing

Use Binance Testnet to verify:
```bash
# Set testnet API keys
BINANCE_TESTNET=true
```

## Default Behavior

- Stop-loss: 2% from entry (5% of position value with 10x leverage)
- Take-profit: 4% from entry (40% of position value with 10x leverage)
- Trailing stop: Disabled by default