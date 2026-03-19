# Quickstart: Binance Futures Trading Bot

## Prerequisites

- Node.js 18+
- npm or yarn
- Binance account (testnet recommended for initial setup)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd node-binance-futures

# Install dependencies
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
```env
# Environment (dev for testnet, prod for production)
STAGE=dev

# Binance API Keys (get from https://testnet.binancefuture.com)
BINANCE_API_KEY=your_testnet_api_key
BINANCE_API_SECRET=your_testnet_api_secret

# Optional: Production keys (use when STAGE=prod)
BINANCE_API_KEY_PROD=your_production_api_key
BINANCE_API_SECRET_PROD=your_production_api_secret
```

3. Get API keys from Binance Testnet:
   - Go to https://testnet.binancefuture.com
   - Create a testnet account
   - Navigate to API Key management
   - Create new API key

## Running the Bot

### Live Trading Mode
```bash
npm run dev
```

### Backtesting Mode
```bash
npm run backtest
```

## Usage Commands

Once running, the bot will:
1. Connect to Binance (testnet or production based on STAGE)
2. Execute trades every 15 minutes based on strategy
3. Manage positions with SL/TP

## Verify Setup

Check your account balance:
```bash
# Test API connection
ts-node -e "import { getAccountBalance } from './src/binance'; getAccountBalance().then(console.log)"
```

## Risk Warning

- Always test on testnet first
- Use conservative settings initially (2% risk, low leverage)
- Monitor the bot closely when starting
- Never invest more than you can afford to lose