# Research: Sistema de Patrones de Scalping con Backtesting

## Phase 0 Findings

### 1. Detección de Patrones de Velas

**Decision**: Implementar detectores individuales para cada patrón usando algoritmos basados en OHLCV

**Rationale**:
- Los patrones de velas tienen definiciones precisas y cuantificables (tamaños de cuerpos, sombras, posiciones relativas)
- Fácil de testear unitariamente
- TypeScript permite tipado estricto para validar datos OHLCV

**Alternatives considered**:
- Usar librería externa (trading-signals): Descartado - añade dependencia heavyweight
- IA para detección: Descartado - overkill para patrones deterministas

### 2. Detección de Patrones de Gráficos

**Decision**: Implementar detección basada en identificación de swing points y canales

**Rationale**:
- Rectángulos: requieren identificar soporte/resistencia horizontales
- Banderas: requieren identificar movemento significativo (pole) seguido de canal
- Más complejos que velas pero still rule-based

**Alternatives considered**:
- Algoritmos de machine learning: Descartado - requiere mucho datos entrenamiento
- Library implementation: Considerado, pero mejor control con implementación propia

### 3. Backtesting Engine

**Decision**: Extender el motor de backtesting existente en `src/backtesting/engine.ts`

**Rationale**:
- El proyecto ya tiene un motor de backtesting funcional
- Agregar new features como optimization es más eficiente que crear desde cero
- Mantiene consistencia con código existente

**Alternatives considered**:
- Nueva librería de backtesting: Descartado - reinventaría la rueda

### 4. Optimización de Parámetros

**Decision**: Grid search con validación hold-out (70/30)

**Rationale**:
- Grid search es determinista y fácil de debuggear
- 70/30 split permite detectar overfitting
- Suficiente para el scope de la feature (50+ variantes)

**Alternatives considered**:
- Genetic algorithms: Descartado - overkill para 50-100 variantes
- Bayesian optimization: Descartado - mejor para espacios continuos grandes

### 5. Formato de Datos Históricos

**Decision**: JSON con formato OHLCV estándar

**Rationale**:
- Binance API retorna este formato
- Fácil de parsear y validar
- Consistente con el ecosistema

**Alternatives considered**:
- CSV: Más difícil de validar tipos
- SQLite: Añade dependencia

## Technical Decisions Summary

| Component | Decision | Rationale |
|-----------|----------|-----------|
| Candle Patterns | Implementación propia rule-based | Precisión, testabilidad |
| Chart Patterns | Swing point detection + canales | Fiabilidad probada |
| Backtesting | Extender engine existente | Consistencia código |
| Optimización | Grid search + hold-out validation | Simple, efectivo |
| Datos | JSON OHLCV | Estandar Binance |

## Dependencies Required

- Ninguna nueva - todo es código propio
- axios ya existe para Binance API
- jest ya existe para testing