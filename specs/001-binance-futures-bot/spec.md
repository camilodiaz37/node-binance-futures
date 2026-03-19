# Feature Specification: Binance Futures Trading Bot

**Feature Branch**: `001-binance-futures-bot`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "El proyecto NODE_BINANCE_FUTURES es una app que funciona como bot de trading de criptomonedas en la plataforma de binance, el bot se enfoca en tradear en futuros y especificamente BTC, para lo cual planifica distintas estrategias para realizar ordenes de compra o venta según las condiciones del mercado, el bot debe manejar una estrategia clara, ademas de funcionar con stop on loss y take profit para controlar las perdidas y ganancias, funcionar con apalancamiento. Ademas se debe hacer un backtesting completo para simular situaciones pasadas y ver si el bot hubiera sido efectivo y encontrar mejoras al funcionamiento/estrategia.

Las tecnologias a usar son node, typescript y las API rest de binance."

## User Scenarios & Testing

### User Story 1 - Automated BTC Futures Trading (Priority: P1)

Como usuario del bot, quiero que el sistema ejecute operaciones de trading automáticamente en BTC/USDT Futures basándose en condiciones predefinidas del mercado, para generar ganancias sin intervención manual constante.

**Why this priority**: Esta es la funcionalidad core del bot - la capacidad de ejecutar trades automáticamente es lo que define el valor del producto.

**Independent Test**: El bot puede ser probado haciendo que analice datos históricos y genere operaciones simuladas, verificando que las órdenes se habrían ejecutado correctamente según las reglas establecidas.

**Acceptance Scenarios**:

1. **Given** el mercado muestra una condición de compra según la estrategia, **When** el bot detecta esta condición, **Then** debe crear una orden de compra con SL y TP configurados
2. **Given** el mercado muestra una condición de venta según la estrategia, **When** el bot detecta esta condición, **Then** debe crear una orden de venta con SL y TP configurados
3. **Given** el precio alcanza el nivel de Take Profit, **When** se activa el trigger, **Then** la posición debe cerrarse automáticamente con ganancia
4. **Given** el precio alcanza el nivel de Stop Loss, **When** se activa el trigger, **Then** la posición debe cerrarse automáticamente limitando la pérdida

---

### User Story 2 - Risk Management with Stop Loss and Take Profit (Priority: P1)

Como usuario del bot, quiero que cada operación tenga Stop Loss y Take Profit configurados para controlar automáticamente mis pérdidas y ganancias, evitando pérdidas catastróficas y asegurando ganancias.

**Why this priority**: Sin control de riesgo, el bot sería financieramente peligroso. SL/TP son esenciales para cualquier sistema de trading.

**Independent Test**: Puede probarse simulando movimientos de precio que activen SL y TP, verificando que las órdenes se cierren correctamente en los niveles esperados.

**Acceptance Scenarios**:

1. **Given** una orden de compra abierta, **When** el precio cae al nivel de Stop Loss, **Then** la orden debe cerrarse automáticamente
2. **Given** una orden de compra abierta, **When** el precio sube al nivel de Take Profit, **Then** la orden debe cerrarse automáticamente con ganancia
3. **Given** el usuario configura un SL de 2%, **When** se abre una posición, **Then** el SL debe colocarse exactamente al 2% del precio de entrada

---

### User Story 3 - Leverage Management (Priority: P2)

Como usuario del bot, quiero poder operar con apalancamiento (leverage) para aumentar mi capacidad de trading con el mismo capital, con controles para gestionar el riesgo asociado.

**Why this priority**: El apalancamiento es una característica fundamental de los futuros que permite maximizar el capital del usuario.

**Independent Test**: Puede probarse verificando que las órdenes se abren con el leverage configurado y que la liquidación ocurre en el nivel de precio correcto según el leverage usado.

**Acceptance Scenarios**:

1. **Given** el usuario configura leverage de 10x, **When** se abre una posición, **Then** la orden debe ejecutarse con 10x de apalancamiento
2. **Given** una posición con 10x leverage y precio entra en zona de liquidación, **When** el precio alcanza el nivel de liquidación, **Then** la posición debe cerrarse forzosamente

---

### User Story 4 - Backtesting Strategy Evaluation (Priority: P2)

Como usuario del bot, quiero poder ejecutar backtests con datos históricos para evaluar si mi estrategia habría sido efectiva en el pasado, identificando fortalezas y debilidades para mejorar el rendimiento.

**Why this priority**: El backtesting permite validar y mejorar estrategias sin arriesgar capital real, siendo esencial para el desarrollo de un bot rentable.

**Independent Test**: Puede probarse ejecutando backtests sobre períodos históricos conocidos y comparando los resultados simulados con resultados esperados.

**Acceptance Scenarios**:

1. **Given** datos históricos de 30 días, **When** se ejecuta un backtest, **Then** el sistema debe simular todas las operaciones que la estrategia habría ejecutado
2. **Given** un backtest completado, **When** el usuario solicita resultados, **Then** debe mostrar métricas incluyendo: ganancia/pérdida total, número de operaciones, tasa de acierto, drawdown máximo

---

### User Story 5 - Strategy Configuration (Priority: P3)

Como usuario del bot, quiero poder configurar los parámetros de mi estrategia de trading (indicadores, timeframes, umbrales) para adaptar el comportamiento del bot a diferentes condiciones de mercado.

**Why this priority**: Permite al usuario ajustar el bot a su tolerancia de riesgo y condiciones de mercado específicas.

**Independent Test**: Cambiando parámetros y verificando que el comportamiento del bot cambia según lo esperado.

**Acceptance Scenarios**:

1. **Given** parámetros de estrategia configurables, **When** el usuario modifica un parámetro, **Then** el bot debe usar los nuevos valores en su próximo análisis

---

### Edge Cases

- ¿Qué sucede cuando la conexión a la API de Binance se pierde durante una operación? → El bot reintenta conexión y cierra posiciones si no se recupera en 5 minutos
- ¿Cómo maneja el bot gaps de precio (price gaps) entre sesiones?
- ¿Qué sucede cuando el saldo de la wallet es insuficiente para abrir una posición?
- ¿Cómo se comporta el bot durante eventos de extrema volatilidad?
- ¿Qué sucede si hay múltiples señales contradictorias en un corto período?

## Requirements

### Functional Requirements

- **FR-001**: El sistema DEBE conectar con la API de Binance Futures y autenticar mediante API Key y Secret
- **FR-002**: El sistema DEBE obtener datos de mercado en tiempo real para BTC/USDT
- **FR-003**: El sistema DEBE ejecutar órdenes de compra (LONG) y venta (SHORT) en Binance Futures
- **FR-004**: El sistema DEBE configurar Stop Loss para cada orden abierta
- **FR-005**: El sistema DEBE configurar Take Profit para cada orden abierta
- **FR-006**: El sistema DEBE permitir configurar el apalancamiento para las operaciones
- **FR-007**: El sistema DEBE obtener datos históricos de Binance para backtesting
- **FR-008**: El sistema DEBE simular operaciones durante backtest sin ejecutar órdenes reales
- **FR-009**: El sistema DEBE calcular y mostrar métricas de rendimiento del backtest
- **FR-010**: El sistema DEBE gestionar el estado de posiciones abiertas y cerradas

### Key Entities

- **Orden**: Representa una operación de trading con tipo (compra/venta), precio de entrada, cantidad, SL, TP, y estado
- **Posición**: Representa una posición abierta en el mercado con precio actual, ganancia/pérdida no realizada
- **Estrategia**: Define las reglas y parámetros para generar señales de trading
- **Configuración**: Parámetros del usuario incluyendo apalancamiento, porcentaje de capital por operación, niveles de SL/TP
- **ResultadoBacktest**: Métricas del backtest incluyendo ganancia total, operaciones ganadas/perdidas, drawdown

## Success Criteria

### Measurable Outcomes

- **SC-001**: El bot ejecuta operaciones automáticamente sin intervención manual una vez iniciado
- **SC-002**: El Stop Loss se ejecuta en el 100% de los casos cuando el precio alcanza el nivel establecido
- **SC-003**: El Take Profit se ejecuta en el 100% de los casos cuando el precio alcanza el nivel establecido
- **SC-004**: El backtest procesa al menos 30 días de datos históricos en menos de 5 minutos
- **SC-005**: Las métricas de backtest incluyen: ganancia/pérdida total, tasa de acierto (win rate), drawdown máximo, número total de operaciones
- **SC-006**: El sistema permite operar con apalancamiento configurable entre 1x y 125x
- **SC-007**: Cada operación usa un máximo del 2% del capital disponible

## Assumptions

- El usuario proporcionará credenciales válidas de API de Binance con permisos para futuros
- El bot operará únicamente en el par BTC/USDT
- Se usará timeframe de 1 hora para el análisis principal
- El bot verificará condiciones de mercado cada 15 minutos
- La estrategia inicial se basará en indicadores técnicos estándar (RSI, MACD, Medias Móviles)
- El backtesting usará datos OHLCV (Open, High, Low, Close, Volume) de Binance

## Notes

- Por ahora el bot se enfoca exclusivamente en BTC/USDT Futures
- No se incluye trading en margen spot, solo futuros
- El backtesting es simulado (no ejecución real de órdenes)

## Clarifications

### Session 2026-03-19

- Q: Porcentaje de riesgo por operación → A: 2% del capital disponible (opción conservadora)
- Q: Frecuencia de ejecución del bot → A: Cada 15 minutos
- Q: Comportamiento ante pérdida de conexión → A: Reintentar conexión y cerrar posiciones si no se recupera en 5 minutos