# Data Model: Sistema de Patrones de Scalping

## Entities

### 1. OHLCV (Data Input)

```typescript
interface OHLCV {
  timestamp: number;      // Unix timestamp (ms)
  open: number;            // Precio de apertura
  high: number;            // Precio máximo
  low: number;             // Precio mínimo
  close: number;           // Precio de cierre
  volume: number;          // Volumen de trading
}
```

**Validation**:
- `high >= max(open, close, low)`
- `low <= min(open, close, high)`
- `volume >= 0`
- `timestamp` debe estar ordenado ascendentemente

### 2. Patrón (Pattern Detection Output)

```typescript
type PatternType =
  | 'MORNING_STAR'
  | 'EVENING_STAR'
  | 'BULLISH_ENGULFING'
  | 'BEARISH_ENGULFING'
  | 'THREE_WHITE_SOLDIERS'
  | 'THREE_BLACK_CROWS'
  | 'BULLISH_RECTANGLE'
  | 'BEARISH_RECTANGLE'
  | 'BULLISH_FLAG'
  | 'BEARISH_FLAG';

type PatternDirection = 'BULLISH' | 'BEARISH';

interface Pattern {
  type: PatternType;
  direction: PatternDirection;
  timestamp: number;           // Cuando se completó el patrón
  price: number;                // Precio de activación
  confidence: number;           // 0-1, baseado en qué tan claro es el patrón
  metadata?: Record<string, any>; // Datos adicionales del patrón
}
```

**Validation**:
- `confidence` between 0 and 1
- Required fields must be present

### 3. ConfiguraciónParámetros (Backtest Parameters)

```typescript
interface BacktestParams {
  stopLossPercent: number;      // 0.5 to 3.0
  takeProfitPercent: number;    // 1.0 to 5.0
  timeframe: '1m' | '5m' | '15m';
  positionSizePercent: number;  // Porcentaje del capital por operación
}
```

**Validation**:
- `stopLossPercent` between 0.5 and 3.0
- `takeProfitPercent` between 1.0 and 5.0
- `timeframe` must be one of allowed values
- `positionSizePercent` between 1 and 100

### 4. ResultadoBacktest (Backtest Result)

```typescript
interface BacktestResult {
  pattern: PatternType;
  params: BacktestParams;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;               // winningTrades / totalTrades
  averageWin: number;            // Profit promedio en operaciones ganadoras
  averageLoss: number;           // Pérdida promedio en operaciones perdedoras
  profitFactor: number;          // averageWin / averageLoss (absolute)
  maxDrawdown: number;           // Drawdown máximo en %
  totalPnL: number;               // P&L total en %
}
```

**Validation**:
- `totalTrades >= winningTrades >= 0`
- `losingTrades = totalTrades - winningTrades`
- `winRate` between 0 and 1
- Si `totalTrades > 0`, entonces `averageWin > 0` y `averageLoss > 0`

### 5. OptimizaciónResultado (Optimization Output)

```typescript
interface OptimizationResult {
  pattern: PatternType;
  topConfigs: BacktestResult[];  // Top 10 configuraciones por winrate
  bestByWinRate: BacktestResult;
  bestByProfitFactor: BacktestResult;
  trainingWinRate: number;
  testWinRate: number;
  overfittingDetected: boolean;  // true si testWinRate < trainingWinRate - 10%
}
```

**Validation**:
- `topConfigs` sorted by winRate descending
- `overfittingDetected` = `trainingWinRate - testWinRate > 10%`

## State Transitions

### Pattern Detection Flow

```
OHLCV[] → Validate → [Filter by timeframe] → Detect Patterns → Pattern[]
```

### Backtest Flow

```
OHLCV[] + Pattern[] + BacktestParams → Simulate Trades → BacktestResult
```

### Optimization Flow

```
OHLCV[] + Pattern[] + ParameterRanges → Generate Variants → Execute Backtests → Rank Results → OptimizationResult
```

## Relationships

```
OHLCV (many) → Pattern (many)
Pattern (one) → BacktestResult (many via params)
BacktestResult (many) → OptimizationResult (one)
```