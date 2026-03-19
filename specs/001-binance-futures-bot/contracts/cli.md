# CLI Interface Contract

The bot exposes a command-line interface with the following commands:

## Commands

### `npm run dev`
Starts the bot in live trading mode.

**Behavior:**
- Loads configuration from environment
- Connects to Binance (testnet or production)
- Runs trading cycle every 15 minutes
- Logs all actions to console

**Output:**
```
[BOT] Starting Binance Futures Trading Bot
[BOT] Connected to testnet
[BOT] Checking market conditions...
[BOT] No trading signal detected
[BOT] Waiting 15 minutes...
```

### `npm run backtest`
Runs backtesting simulation.

**Behavior:**
- Loads historical data from Binance
- Simulates strategy on historical data
- Outputs performance metrics

**Output:**
```
[BACKTEST] Starting backtest...
[BACKTEST] Loading 30 days of BTC/USDT data...
[BACKTEST] Simulating trades...
[BACKTEST] Backtest complete!
[BACKTEST] Results:
  - Total Trades: 45
  - Win Rate: 60%
  - Total Return: 12.5%
  - Max Drawdown: 8.3%
```

## Error Handling

All errors are logged to stderr with descriptive messages:
- Connection failures: `[ERROR] Failed to connect to Binance: <details>`
- Trading errors: `[ERROR] Order failed: <details>`
- Configuration errors: `[ERROR] Invalid configuration: <details>`

## Exit Codes

- 0: Successful execution
- 1: Error occurred (check logs)