# Research: Binance Futures Trading Bot

## Decisions Made

### 1. Language & Runtime
- **Decision**: Node.js with TypeScript
- **Rationale**: User-specified requirement. Already in use in project.
- **Alternatives Considered**: None (project constraint)

### 2. Binance API Integration
- **Decision**: REST API (not WebSocket) for orders, WebSocket for price updates
- **Rationale**: REST API sufficient for order execution; WebSocket for real-time price monitoring
- **Alternatives Considered**:
  - Pure REST polling: Higher latency
  - Official SDK (binance-connector-node): Adds dependency; current custom implementation sufficient

### 3. Backtesting Engine
- **Decision**: Custom simulation engine using historical klines
- **Rationale**: Already partially implemented in src/backtesting/
- **Alternatives Considered**:
  - Backtesting libraries: Overkill for single-pair strategy
  - TradingView backtest: Not suitable for programmatic trading

### 4. Technical Indicators
- **Decision**: RSI, MACD, SMA as initial indicators
- **Rationale**: Standard, well-documented indicators suitable for initial strategy
- **Alternatives Considered**:
  - TradingView Pine Script: Would require separate implementation
  - More complex: Defer until basic strategy validated

### 5. Configuration Management
- **Decision**: Environment variables + config file
- **Rationale**: Simple, no external dependency, works with existing .env setup
- **Alternatives Considered**:
  - JSON/YAML config files: Adds parsing dependency
  - Database: Overkill for single-user bot

### 6. Execution Frequency
- **Decision**: 15-minute intervals (from clarification)
- **Rationale**: Balances responsiveness with API rate limits
- **Alternatives Considered**:
  - 5 minutes: Too aggressive, higher fees
  - 1 hour: Too slow for active trading

### 7. Risk Management
- **Decision**: 2% max risk per trade, SL/TP mandatory
- **Rationale**: Industry standard for conservative trading
- **Alternatives Considered**:
  - Higher risk: More volatility, faster account depletion
  - Dynamic sizing: More complex, defer to future iteration

## Known Dependencies

- express (for server/API if needed)
- dotenv (already installed)
- TypeScript (already configured)

## To Be Determined During Implementation

- Specific indicator thresholds for buy/sell signals
- Exact SL/TP percentage configuration
- Logging and notification system details