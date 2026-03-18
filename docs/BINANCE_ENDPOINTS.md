# Endpoints de Binance API para Scalping con Apalancamiento

## Endpoints Requeridos para Estrategia de Scalping

### 1. Datos de Mercado (Market Data)

| Endpoint               | Método | Descripción                                  |
| ---------------------- | ------ | -------------------------------------------- |
| `/api/v3/ticker/price` | GET    | Precio actual del símbolo (baja latencia)    |
| `/api/v3/ticker/24hr`  | GET    | Estadísticas 24hr (precio, volumen, cambios) |
| `/api/v3/klines`       | GET    | Velas/candlesticks para análisis técnico     |
| `/api/v3/depth`        | GET    | Order book (profundidad de mercado)          |
| `/api/v3/trades`       | GET    | Trades recientes                             |

### 2. Gestión de Apalancamiento

| Endpoint                  | Método | Descripción                             |
| ------------------------- | ------ | --------------------------------------- |
| `POST /api/v3/leverage`   | POST   | Establecer apalancamiento (1-125x)      |
| `POST /api/v3/marginType` | POST   | Cambiar tipo de margen (cross/isolated) |

### 3. Trading (Órdenes)

| Endpoint                       | Método | Descripción                         |
| ------------------------------ | ------ | ----------------------------------- |
| `POST /api/v3/order`           | POST   | Colocar orden (LIMIT, MARKET, STOP) |
| `DELETE /api/v3/order`         | DELETE | Cancelar orden                      |
| `DELETE /api/v3/allOpenOrders` | DELETE | Cancelar todas las órdenes abiertas |
| `GET /api/v3/order`            | GET    | Consultar orden específica          |
| `GET /api/v3/openOrders`       | GET    | Listar órdenes abiertas             |
| `GET /api/v3/allOrders`        | GET    | Historial de órdenes                |

### 4. Posiciones y Cuenta

| Endpoint                   | Método | Descripción                        |
| -------------------------- | ------ | ---------------------------------- |
| `GET /api/v3/positionRisk` | GET    | Información de posiciones actuales |
| `GET /api/v3/account`      | GET    | Estado de cuenta y balances        |
| `GET /api/v3/balance`      | GET    | Balance de wallet                  |
| `GET /api/v3/openInterest` | GET    | Interés abierto                    |

### 5. WebSocket (Tiempo Real)

| Endpoint                                                 | Descripción          |
| -------------------------------------------------------- | -------------------- |
| `wss://fstream.binance.com/ws/<symbol>@trade`            | Trade en tiempo real |
| `wss://fstream.binance.com/ws/<symbol>@ticker`           | Ticker 24hr          |
| `wss://fstream.binance.com/ws/<symbol>@depth`            | Order book           |
| `wss://fstream.binance.com/ws/<symbol>@kline_<interval>` | Velas en tiempo real |

---

## Estrategia de Scalping Propuesta

### Lógica de Trading

```
1. SELECCIÓN DE PAR: BTCUSDT, ETHUSDT (alta liquidez)
2. TIMEFRAME: 1m o 5m para scalping
3. INDICADORES:
   - RSI (14): Sobrevendido <30, Sobrecomprado >70
   - EMA 9 y EMA 21: Cruces para señales
   - Volumen: Confirmar movimientos
4. GESTIÓN DE RIESGO:
   - Stop loss: 0.5% - 1% del capital
   - Take profit: 0.3% - 0.8% por operación
   - Apalancamiento recomendado: 10x - 20x
```

### Flujo de Ejecución

```typescript
// 1. Configurar apalancamiento
await setLeverage("BTCUSDT", 20);

// 2. Obtener precio actual
const price = await getTickerPrice("BTCUSDT");

// 3. Detectar señal de entrada
const signal = await analyzeSignal("BTCUSDT");

// 4. Colocar orden
if (signal === "LONG") {
  await placeOrder("BTCUSDT", "BUY", "LIMIT", quantity, entryPrice);
} else if (signal === "SHORT") {
  await placeOrder("BTCUSDT", "SELL", "LIMIT", quantity, entryPrice);
}

// 5. Colocar stop loss y take profit
await placeStopLoss("BTCUSDT", stopPrice);
await placeTakeProfit("BTCUSDT", tpPrice);
```

### Consideraciones Importantes

- **Rate Limits**: Respetar límites de la API (1200 requests/min)
- **recvWindow**: Usar 5000ms para evitar errores de timing
- **Testnet**: Probar siempre en testnet primero
- **Gestión de Capital**: No arriesgar más del 2% por operación

---

## URLs de API

| Ambiente   | URL Base                         |
| ---------- | -------------------------------- |
| Testnet    | `https://testnet.binance.vision` |
| Producción | `https://fapi.binance.com`       |

---

## Ejemplo de Headers para Requests Firmados

```typescript
{
  'X-MBX-APIKEY': API_KEY,
  'Content-Type': 'application/json'
}
```

Los endpoints firmados requieren:

- `timestamp`: Date.now()
- `signature`: HMAC-SHA256(queryString, API_SECRET)
