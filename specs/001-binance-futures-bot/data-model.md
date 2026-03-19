# Data Model: Binance Futures Trading Bot

## Entities

### Order (Orden)
Represents a trading order in the system.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (Binance orderId) |
| symbol | string | Trading pair (e.g., BTCUSDT) |
| type | enum | BUY or SELL |
| side | enum | LONG or SHORT |
| quantity | number | Amount of BTC |
| entryPrice | number | Price at which order was opened |
| currentPrice | number | Current market price |
| stopLoss | number | Stop loss price (null if not set) |
| takeProfit | number | Take profit price (null if not set) |
| status | enum | PENDING, OPEN, CLOSED, CANCELLED |
| leverage | number | Leverage multiplier (1-125) |
| openedAt | timestamp | When the order was opened |
| closedAt | timestamp | When the order was closed (null if open) |
| pnl | number | Profit/Loss in USDT (null if open) |

**State Transitions**:
- PENDING → OPEN (when order fills)
- OPEN → CLOSED (when SL/TP triggers or manual close)
- OPEN → CANCELLED (when order is cancelled)

---

### Position (Posición)
Represents an open market position.

| Field | Type | Description |
|-------|------|-------------|
| orderId | string | Reference to the Order |
| symbol | string | Trading pair |
| side | enum | LONG or SHORT |
| quantity | number | Position size |
| entryPrice | number | Average entry price |
| unrealizedPnl | number | Current P&L |
| marginUsed | number | Margin locked for position |
| liquidationPrice | number | Price at which position liquidates |

---

### Strategy (Estrategia)
Defines the trading strategy parameters.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Strategy identifier |
| timeframe | string | Chart timeframe (1m, 5m, 15m, 1h, 4h, 1d) |
| indicators | object | Indicator configurations |
| rsiPeriod | number | RSI lookback period (default: 14) |
| rsiOverbought | number | RSI overbought threshold (default: 70) |
| rsiOversold | number | RSI oversold threshold (default: 30) |
| macdFast | number | MACD fast period (default: 12) |
| macdSlow | number | MACD slow period (default: 26) |
| macdSignal | number | MACD signal period (default: 9) |
| smaPeriod | number | SMA lookback period (default: 50) |

---

### Configuration (Configuración)
User configuration and settings.

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Binance API key |
| apiSecret | string | Binance API secret |
| testnet | boolean | Use testnet or production |
| leverage | number | Default leverage (1-125) |
| riskPercent | number | Risk per trade as percentage (default: 2) |
| stopLossPercent | number | SL distance as percentage |
| takeProfitPercent | number | TP distance as percentage |
| executionInterval | number | Minutes between bot cycles |

---

### BacktestResult (ResultadoBacktest)
Results from a backtest run.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| startDate | timestamp | Backtest start |
| endDate | timestamp | Backtest end |
| initialCapital | number | Starting capital |
| finalCapital | number | Ending capital |
| totalReturn | number | Total return percentage |
| totalTrades | number | Total number of trades |
| winningTrades | number | Number of profitable trades |
| losingTrades | number | Number of losing trades |
| winRate | number | Win rate percentage |
| maxDrawdown | number | Maximum drawdown percentage |
| avgTradeDuration | number | Average trade duration in minutes |
| trades | array | Individual trade details |

---

## Key Relationships

```
Configuration → Strategy (one-to-one)
Order → Position (one-to-one, when OPEN)
Strategy → BacktestResult (one-to-many)
```

## Validation Rules

- Order quantity must be >= 0.001 BTC
- Leverage must be between 1 and 125
- SL must be below entry for LONG, above for SHORT
- TP must be above entry for LONG, below for SHORT
- Risk per trade cannot exceed 10% of capital