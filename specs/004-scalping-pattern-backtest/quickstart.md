# Quickstart: Sistema de Patrones de Scalping

## Usage

### 1. Detectar Patrones en Datos Históricos

```bash
# Detectar todos los patrones en archivo de datos
npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json

# Detectar solo patrones de velas
npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json --types candles

# Detectar solo patrones de gráficos
npx ts-node src/patterns/cli.ts detect --file data/historical/btcusdt-1m.json --types charts
```

### 2. Ejecutar Backtest

```bash
# Backtest con parámetros por defecto
npx ts-node src/backtesting/cli.ts backtest --pattern MORNING_STAR --file data/historical/btcusdt-1m.json

# Backtest con parámetros custom
npx ts-node src/backtesting/cli.ts backtest \
  --pattern MORNING_STAR \
  --file data/historical/btcusdt-1m.json \
  --sl 1.5 \
  --tp 3.0
```

### 3. Optimizar Parámetros

```bash
# Optimizar para un patrón
npx ts-node src/backtesting/cli.ts optimize \
  --pattern MORNING_STAR \
  --file data/historical/btcusdt-1m.json

# Optimizar para todos los patrones
npx ts-node src/backtesting/cli.ts optimize-all \
  --file data/historical/btcusdt-1m.json

# Output: Ranking de mejores configuraciones
```

### 4. Análisis de Robustez

```bash
# Validar que no hay overfitting
npx ts-node src/backtesting/cli.ts validate \
  --pattern MORNING_STAR \
  --file data/historical/btcusdt-1m.json
```

## Formato de Datos de Entrada

Archivo JSON con array de velas OHLCV:

```json
[
  {
    "timestamp": 1704067200000,
    "open": 42000.0,
    "high": 42500.0,
    "low": 41800.0,
    "close": 42300.0,
    "volume": 1234.56
  }
]
```

## Formato de Resultados

### Backtest Result

```json
{
  "pattern": "MORNING_STAR",
  "params": {
    "stopLossPercent": 1.5,
    "takeProfitPercent": 3.0,
    "timeframe": "1m",
    "positionSizePercent": 10
  },
  "totalTrades": 45,
  "winningTrades": 28,
  "losingTrades": 17,
  "winRate": 0.622,
  "averageWin": 2.8,
  "averageLoss": 1.4,
  "profitFactor": 2.0
}
```

### Optimization Result

```json
{
  "pattern": "MORNING_STAR",
  "topConfigs": [
    { "winRate": 0.68, "params": {...} },
    { "winRate": 0.65, "params": {...} }
  ],
  "bestByWinRate": { ... },
  "bestByProfitFactor": { ... },
  "trainingWinRate": 0.68,
  "testWinRate": 0.61,
  "overfittingDetected": false
}
```

## Configuración de Parámetros

| Parámetro | Rango | Default |
|-----------|-------|---------|
| stopLossPercent | 0.5 - 3.0 | 2.0 |
| takeProfitPercent | 1.0 - 5.0 | 4.0 |
| timeframe | 1m, 5m, 15m | 1m |
| positionSizePercent | 1 - 100 | 10 |