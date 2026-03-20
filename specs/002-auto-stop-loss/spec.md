# Feature Specification: Automatic Stop-Loss, Take-Profit, and Trailing Stop

**Feature Branch**: `002-auto-stop-loss`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "implementar un stop on loss y take profit automatico, ya que actualmente no se estan seteando esos valores en las ordenes de compra o venta, ademas de configurar un trailing stop"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Stop-Loss and Take-Profit Placement (Priority: P1)

The trading bot automatically sets stop-loss and take-profit prices when placing buy or sell orders on Binance Futures.

**Why this priority**: This is the core safety mechanism for risk management. Without it, users have unlimited downside risk and no exit strategy for profits.

**Independent Test**: Can be tested by placing test orders and verifying that stop-loss and take-profit values are included in the order request to Binance API.

**Acceptance Scenarios**:

1. **Given** user configures stop-loss at 2% and take-profit at 4%, **When** bot places a LONG order at $50,000, **Then** stop-loss is set at $49,000 and take-profit at $52,000
2. **Given** user configures stop-loss at 2% and take-profit at 4%, **When** bot places a SHORT order at $50,000, **Then** stop-loss is set at $51,000 and take-profit at $48,000
3. **Given** stop-loss is triggered at $49,000 for a LONG position, **When** price reaches stop-loss level, **Then** position is closed automatically
4. **Given** take-profit is triggered at $52,000 for a LONG position, **When** price reaches take-profit level, **Then** position is closed automatically

---

### User Story 2 - Trailing Stop Configuration (Priority: P2)

The bot supports trailing stop functionality that follows price movement to protect profits while allowing continued upside potential.

**Why this priority**: Trailing stops maximize profit protection by locking in gains as price moves favorably, without manual intervention.

**Independent Test**: Can be tested by simulating price movements and verifying the trailing stop activates at the correct percentage from the highest price.

**Acceptance Scenarios**:

1. **Given** trailing stop is enabled at 2%, **When** LONG position enters at $50,000 and price rises to $52,000, **Then** trailing stop is set at $50,960 (2% below $52,000)
2. **Given** trailing stop is active at $50,960, **When** price drops to that level, **Then** position is closed
3. **Given** trailing stop is enabled, **When** price continues upward to $53,000, **Then** trailing stop updates to $51,940 (moves with price)

---

### User Story 3 - Configurable Risk Parameters (Priority: P3)

Users can configure stop-loss percentage, take-profit percentage, and trailing stop activation through environment variables.

**Why this priority**: Allows users to customize risk management settings without code changes, adapting to different market conditions and risk tolerance.

**Independent Test**: Can be tested by modifying environment variables and verifying the bot uses the new values.

**Acceptance Scenarios**:

1. **Given** STOP_LOSS_PERCENT is set to 3%, **When** bot calculates stop-loss, **Then** uses 3% instead of default 2%
2. **Given** TAKE_PROFIT_PERCENT is set to 6%, **When** bot calculates take-profit, **Then** uses 6% instead of default 4%
3. **Given** TRAILING_STOP_PERCENT is set to 2.5%, **When** trailing stop is activated, **Then** uses 2.5% from peak price
4. **Given** TRAILING_STOP_ENABLED is set to false, **When** bot processes positions, **Then** trailing stop is not applied

---

### Edge Cases

- What happens when stop-loss percentage is greater than take-profit percentage?
- How does the system handle orders when Binance API returns an error for stop-loss/take-profit placement?
- What occurs when trailing stop percentage is set to 0 or negative?
- How are orders handled during high volatility where price gaps beyond stop-loss?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate stop-loss price as percentage below entry for LONG positions and above entry for SHORT positions
- **FR-002**: System MUST calculate take-profit price as percentage above entry for LONG positions and below entry for SHORT positions
- **FR-003**: System MUST include stop-loss and take-profit prices in all order placements to Binance Futures API
- **FR-004**: System MUST automatically close positions when stop-loss price is reached (for LONG: price <= stop-loss, for SHORT: price >= stop-loss)
- **FR-005**: System MUST automatically close positions when take-profit price is reached (for LONG: price >= take-profit, for SHORT: price <= take-profit)
- **FR-006**: System MUST support trailing stop that activates after a configurable percentage of profit is achieved
- **FR-007**: System MUST update trailing stop level as price moves favorably, always maintaining the configured percentage distance from the highest price
- **FR-008**: System MUST trigger trailing stop when price retreats by the configured percentage from the highest achieved price
- **FR-009**: System MUST read stop-loss, take-profit, and trailing stop parameters from environment configuration
- **FR-010**: System MUST log all stop-loss and take-profit activations for audit purposes

### Key Entities *(include if feature involves data)*

- **Position**: Represents an active trade with entry price, type (LONG/SHORT), stop-loss, take-profit, and trailing stop information
- **Order**: Contains the trading order details including the calculated stop-loss and take-profit values to be sent to Binance
- **RiskConfig**: Stores user-configured risk management parameters (stop-loss percent, take-profit percent, trailing stop percent, trailing stop enabled flag)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All buy and sell orders placed by the bot include valid stop-loss and take-profit values
- **SC-002**: Stop-loss triggers within 1% of the configured percentage from entry price
- **SC-003**: Take-profit triggers within 1% of the configured percentage from entry price
- **SC-004**: Trailing stop updates within 1 second of price reaching new high/low for the position
- **SC-005**: 100% of activated stop-loss and take-profit events are logged with timestamp and price