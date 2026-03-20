# Feature Specification: Backtesting with 40 Real Market Scenarios and Strategy Analysis

**Feature Branch**: `003-backtesting-analysis`
**Created**: 2026-03-20
**Status**: Draft
**Input**: User description: "crear un backtesting con 40 situaciones reales tomadas de forma aleatoria, ejecutar los test y hacer un analisis para mejorar la estrategia de trading"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate 40 Random Real Market Scenarios (Priority: P1)

The system generates 40 different market scenarios using real historical price patterns that represent common trading situations.

**Why this priority**: Having diverse, realistic test scenarios is fundamental to validating the trading strategy's effectiveness.

**Independent Test**: Can be verified by running the backtester and confirming 40 distinct scenarios are executed with different market conditions.

**Acceptance Scenarios**:

1. **Given** user runs the backtest command, **When** the system executes, **Then** 40 unique scenarios are generated with varied price movements
2. **Given** the scenario generator runs, **When** scenarios include both trending and ranging markets, **Then** each scenario represents a realistic market condition
3. **Given** scenarios are generated, **When** random selection is applied, **Then** each run produces different combinations of market situations

---

### User Story 2 - Execute Backtests and Collect Results (Priority: P1)

The system executes trades on each of the 40 scenarios and collects performance metrics including profit/loss, win rate, and trade count.

**Why this priority**: This provides the data needed to evaluate strategy performance across diverse market conditions.

**Independent Test**: Can be verified by running backtests and reviewing the generated results report.

**Acceptance Scenarios**:

1. **Given** 40 scenarios are available, **When** the backtest executes, **Then** each scenario runs a complete simulation from entry to exit
2. **Given** a trade is simulated, **When** stop-loss or take-profit is triggered, **Then** the trade result is recorded with exact PnL
3. **Given** all scenarios complete, **When** results are collected, **Then** aggregate metrics include total trades, winning trades, losing trades, and total PnL

---

### User Story 3 - Analyze Results and Identify Strategy Improvements (Priority: P1)

The system analyzes the backtest results to identify patterns, strengths, and weaknesses in the trading strategy.

**Why this priority**: This analysis provides actionable insights to improve the trading strategy's performance.

**Independent Test**: Can be verified by reviewing the generated analysis report with specific recommendations.

**Acceptance Scenarios**:

1. **Given** backtest results are available, **When** analysis runs, **Then** it identifies win rate by market condition (trending vs ranging)
2. **Given** trade data exists, **When** analysis runs, **Then** it calculates average profit per winning trade and average loss per losing trade
3. **Given** SL/TP performance is analyzed, **When** results are processed, **Then** it shows percentage of trades stopped out vs taking profit

---

### User Story 4 - Generate Comprehensive Report (Priority: P2)

The system generates a detailed report with visualizations and recommendations for strategy improvement.

**Why this priority**: Provides clear, actionable insights for traders to make informed decisions about strategy adjustments.

**Independent Test**: Can be verified by running the report command and reviewing the output.

**Acceptance Scenarios**:

1. **Given** analysis is complete, **When** the report is generated, **Then** it includes a summary table with key metrics
2. **Given** performance data exists, **When** the report is generated, **Then** it provides specific recommendations for parameter adjustments

---

### Edge Cases

- What happens when all 40 scenarios result in losing trades?
- How does the system handle scenarios with extremely high volatility?
- What occurs when a scenario has insufficient data points to generate a signal?
- How are edge cases with flat price movements (no trend) handled?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate 40 unique market scenarios covering different conditions (bullish, bearish, ranging, volatile)
- **FR-002**: System MUST use realistic price movements based on historical BTCUSDT patterns
- **FR-003**: System MUST execute trades with proper SL/TP logic on each scenario
- **FR-004**: System MUST track individual trade results (entry price, exit price, PnL, reason for exit)
- **FR-005**: System MUST calculate aggregate metrics: total trades, win rate, average win, average loss, profit factor
- **FR-006**: System MUST analyze performance by market condition type
- **FR-007**: System MUST generate recommendations for strategy parameter adjustments
- **FR-008**: System MUST allow random selection of scenarios for varied test runs
- **FR-009**: System MUST provide a reproducible seed option for consistent test results when needed

### Key Entities *(include if feature involves data)*

- **Scenario**: Represents a single market situation with 20 price points and known trend direction
- **BacktestResult**: Contains aggregated metrics from all 40 scenario runs
- **TradeResult**: Individual trade outcome with entry, exit, PnL, and exit reason
- **AnalysisReport**: Generated insights with recommendations for strategy improvement

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 40 distinct scenarios are executed in each backtest run
- **SC-002**: Win rate is calculated and displayed as a percentage
- **SC-003**: Profit factor (gross profit / gross loss) is calculated and displayed
- **SC-004**: Analysis identifies at least 3 specific patterns in winning vs losing trades
- **SC-005**: Report includes actionable recommendations for SL/TP percentage adjustments
- **SC-006**: Average trade duration is measured and reported
- **SC-007**: Strategy performance is categorized by market condition (trending bullish, trending bearish, ranging, volatile)

## Assumptions

- Scenarios will be generated programmatically using BTCUSDT historical price patterns
- Each scenario consists of 20 candles to allow sufficient indicator calculation
- Stop-loss and take-profit use current default percentages (2% and 4%)
- Analysis will focus on the existing RSI+MACD+SMA strategy