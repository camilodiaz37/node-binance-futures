# Feature Specification: Sistema de Reconocimiento de Patrones de Scalping con Backtesting

**Feature Branch**: `004-scalping-pattern-backtest`
**Created**: 2026-03-20
**Status**: Draft
**Input**: User description: "Implementar sistema de reconocimiento de patrones de scalping con backtesting y optimización de parámetros para lograr alto winrate"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detección de Patrones de Velas (Priority: P1)

Como trader, quiero que el sistema identifique automáticamente patrones de velas (Morning Star, Evening Star, Envolventes, Tres Soldados, Tres Cuervos) en los datos de precios para generar señales de trading.

**Why this priority**: Los patrones de velas son las señales más frecuentes y rápidas de detectar, permitiendo decisiones de trading ágiles en scalping.

**Independent Test**: El sistema puede analizar un conjunto de velas históricas e identificar todos los patrones definidos, outputting la lista de patrones encontrados con timestamps.

**Acceptance Scenarios**:

1. **Given** datos de velas bajistas (3 velas), **When** se forma un patrón Morning Star (vela larga bajista + vela pequeña + vela larga alcista que cierra arriba del punto medio), **Then** el sistema reporta "Morning Star detectado" con dirección ALCISTA
2. **Given** datos de velas alcistas (3 velas), **When** se forma un patrón Evening Star (vela larga alcista + vela pequeña + vela larga bajista que cierra bajo el punto medio), **Then** el sistema reporta "Evening Star detectado" con dirección BAJISTA
3. **Given** dos velas consecutivas, **When** la segunda vela cubre completamente el cuerpo de la primera (Engulfing), **Then** el sistema reporta el tipo de Engulfing (alcista o bajista)
4. **Given** tres velas consecutivas alcistas, **When** cada vela abre dentro del cuerpo anterior y cierra más alto, **Then** el sistema reporta "Tres Soldados Blancos"
5. **Given** tres velas consecutivas bajistas, **When** cada vela abre dentro del cuerpo anterior y cierra más bajo, **Then** el sistema reporta "Tres Cuervos Negros"

---

### User Story 2 - Detección de Patrones de Gráficos (Priority: P1)

Como trader, quiero que el sistema identifique patrones de gráficos (Rectángulos, Banderas) para detectar rompimientos y continuación de tendencias.

**Why this priority**: Los patrones de gráficos son más fiables que los de velas y permiten definir niveles exactos de entrada y salida.

**Independent Test**: El sistema puede analizar datos de precios y detectar consolidación lateral (rectángulo) o formación de bandera tras movimiento significativo, outputting los niveles de soporte/resistencia.

**Acceptance Scenarios**:

1. **Given** precio moviéndose entre soporte y resistencia definidos, **When** el precio rompe resistencia en un rectángulo alcista, **Then** el sistema reporta "Breakout Alcista" con precio de ruptura
2. **Given** precio moviéndose entre soporte y resistencia, **When** el precio rompe soporte en un rectángulo bajista, **Then** el sistema reporta "Breakout Bajista"
3. **Given** un movimiento significativo de precios (pole), **When** el precio forma un canal descendente (bandeira), **Then** el sistema reporta "Banderín Bajista" y espera ruptura
4. **Given** un movimiento significativo de precios, **When** el precio forma un canal ascendente, **Then** el sistema reporta "Banderín Alcista"

---

### User Story 3 - Backtesting de Patrones (Priority: P1)

Como trader, quiero ejecutar backtests de los patrones detectados contra datos históricos para evaluar su efectividad antes de operar en vivo.

**Why this priority**: El backtesting permite validar la efectividad de cada patrón sin riesgo financiero real.

**Independent Test**: El sistema puede ejecutar múltiples backtests con datos históricos y generar reporte de resultados por patrón.

**Acceptance Scenarios**:

1. **Given** datos históricos de precios y un patrón específico, **When** se ejecuta el backtest, **Then** el sistema reporta: número de operaciones, ganadas, perdidas, winrate, profit factor
2. **Given** un período histórico de 30 días, **When** se ejecutan todos los patrones, **Then** el sistema genera ranking de patrones por winrate
3. **Given** datos con gaps o períodos sin datos, **When** se ejecuta backtest, **Then** el sistema reporta los períodos omitidos y continúa el análisis

---

### User Story 4 - Optimización de Parámetros (Priority: P2)

Como trader, quiero generar múltiples variantes de parámetros (stop-loss, take-profit, timeframe) para cada patrón y encontrar la combinación con mayor winrate.

**Why this priority**: La optimización de parámetros permite encontrar configuraciones específicas que maximizan la efectividad de cada patrón.

**Independent Test**: El sistema puede ejecutar-backtests con múltiples combinaciones de parámetros y generar tabla comparativa de resultados.

**Acceptance Scenarios**:

1. **Given** un patrón y rango de parámetros (SL: 0.5%-3%, TP: 1%-5%), **When** se ejecuta optimización, **Then** el sistema reporta las 10 mejores combinaciones por winrate
2. **Given** múltiples timeframes (1m, 5m, 15m), **When** se optimiza para cada uno, **Then** el sistema indica cuál timeframe tiene mejor rendimiento para cada patrón
3. **Given** volumen mínimo de operaciones (mínimo 30 operaciones por configuración), **When** se genera reporte, **Then** el sistema excluye configuraciones con menos operaciones del ranking

---

### User Story 5 - Análisis de Sensibilidad y Robustez (Priority: P3)

Como trader, quiero analizar si los resultados del backtest son robustos o si son sensibles a pequeños cambios en parámetros.

**Why this priority**: Parámetros excesivamente optimizados pueden fallar en datos nuevos. La robustez indica que el sistema puede operar consistentemente.

**Independent Test**: El sistema puede ejecutar análisis de sensibilidad y reportar rangos de parámetros estables.

**Acceptance Scenarios**:

1. **Given** una configuración óptima, **When** se varia ±20% los parámetros, **Then** el sistema reporta cuánto baja el winrate en cada caso
2. **Given** datos de entrenamiento y datos de prueba separados, **When** se comparan resultados, **Then** el sistema reporta diferencia de winrate (overfitting if >10%)

---

### Edge Cases

- ¿Qué sucede cuando no hay suficiente historial de velas para detectar un patrón (menos de 3 velas)?
- ¿Cómo maneja el sistema datos de precios con alta volatilidad (gaps grandes)?
- ¿Qué sucede cuando dos patrones se solapan en el mismo período?
- ¿Cómo afecta el spread del broker a los resultados del backtest?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE detectar Morning Star y Evening Star en datos de velas con precisión del 100% según definición (vela larga + vela pequeña + vela larga que cierra más allá del punto medio)
- **FR-002**: El sistema DEBE detectar Engulfing Alcista cuando una vela bajista es completamente cubierta por una vela bajista siguiente más grande
- **FR-003**: El sistema DEBE detectar Tres Soldados Blancos cuando tres velas alcistas consecutivas abren dentro del cuerpo anterior y cierran más alto
- **FR-004**: El sistema DEBE detectar Tres Cuervos Negros cuando tres velas bajistas consecutivas abren dentro del cuerpo anterior y cierran más bajo
- **FR-005**: El sistema DEBE identificar Rectángulos Alcistas cuando el precio rompe resistencia con volumen confirmado
- **FR-006**: El sistema DEBE identificar Banderas Alcistas y Bajistas después de un movimiento significativo (pole) con precio de ruptura
- **FR-007**: El sistema DEBE ejecutar backtests con datos históricos y reportar: total operaciones, operaciones ganadas, operaciones perdidas, winrate, profit promedio, pérdida promedio
- **FR-008**: El sistema DEBE generar mínimo 50 variantes de parámetros por patrón (combinaciones de SL, TP, timeframe)
- **FR-009**: El sistema DEBE excluir configuraciones con menos de 30 operaciones del análisis de optimización
- **FR-010**: El sistema DEBE generar ranking de mejores configuraciones por winrate para cada patrón
- **FR-011**: El sistema DEBE comparar resultados entre datos de entrenamiento y prueba para detectar overfitting

### Key Entities *(include if data involved)*

- **Patrón**: Representa una configuración detectada con tipo (velas/gráfico), dirección (alcista/bajista), precio de activación, y timestamp
- **ResultadoBacktest**: Métricas de una ejecución de backtest incluyendo patrón, parámetros usados, y métricas de rendimiento
- **ConfiguraciónParámetros**: Conjunto de valores (stop-loss %, take-profit %, timeframe, tamaño de posición) para una ejecución
- **OptimizaciónResultado**: Ranking de configuraciones ordenadas por winrate con métricas asociadas

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El sistema identifica correctamente el 100% de los patrones de velas definidos cuando los datos cumplen criterios de identificación
- **SC-002**: El sistema ejecuta backtests de al menos 50 variantes de parámetros por patrón en menos de 5 minutos
- **SC-003**: El sistema genera rankings de optimización con un mínimo de 10 configuraciones válidas (30+ operaciones) por patrón
- **SC-004**: El sistema reporta diferencia de winrate entre datos de entrenamiento y prueba para validar robustez
- **SC-005**: El sistema distingue entre patrones de velas (alta frecuencia) y patrones de gráficos (mayor fiabilidad) en el análisis de resultados

## Assumptions *(optional)*

- Los datos históricos de precios tienen formato estándar (OHLCV)
- El usuario proporcionará o el sistema obtendrá datos históricos suficientes (mínimo 30 días)
- El análisis de overfitting usadivisión 70/30 entrenamiento/prueba
- Los parámetros de optimización incluirán: stop-loss (0.5% a 3%), take-profit (1% a 5%), timeframe (1m, 5m, 15m)