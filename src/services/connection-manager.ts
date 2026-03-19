import { getBinanceFuturesClient } from "./binance-futures";
import { closePosition } from "./trade-executor";

const CONNECTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface ConnectionState {
  isConnected: boolean;
  lastCheck: Date | null;
  consecutiveFailures: number;
  timeoutId: NodeJS.Timeout | null;
}

/**
 * Connection manager handles connection loss scenarios
 */
class ConnectionManager {
  private state: ConnectionState = {
    isConnected: true,
    lastCheck: null,
    consecutiveFailures: 0,
    timeoutId: null,
  };

  private onConnectionRestored?: () => void;
  private onConnectionLost?: () => void;

  constructor(onRestored?: () => void, onLost?: () => void) {
    this.onConnectionRestored = onRestored;
    this.onConnectionLost = onLost;
  }

  /**
   * Check connection health
   */
  async checkConnection(): Promise<boolean> {
    this.state.lastCheck = new Date();

    try {
      const client = getBinanceFuturesClient();
      await client.getCurrentPrice("BTCUSDT");

      // Connection successful
      if (!this.state.isConnected) {
        console.log("🔄 Conexión restaurada");
        this.onConnectionRestored?.();
      }

      this.state.isConnected = true;
      this.state.consecutiveFailures = 0;

      // Cancel any pending timeout
      if (this.state.timeoutId) {
        clearTimeout(this.state.timeoutId);
        this.state.timeoutId = null;
      }

      return true;
    } catch (error) {
      this.state.consecutiveFailures++;
      console.warn(`⚠️ Error de conexión (intento ${this.state.consecutiveFailures})`);

      if (this.state.consecutiveFailures >= 3 && this.state.isConnected) {
        this.handleConnectionLost();
      }

      return false;
    }
  }

  /**
   * Handle connection loss - start timeout to close positions
   */
  private handleConnectionLost(): void {
    if (this.state.timeoutId) return;

    this.state.isConnected = false;
    console.error("❌ Conexión perdida con Binance");

    this.onConnectionLost?.();

    // Start 5-minute timeout
    this.state.timeoutId = setTimeout(async () => {
      console.error("⏰ Timeout de conexión - cerrando posiciones...");

      try {
        // Close all open positions
        const result = await closePosition();

        if (result.success) {
          console.log("✅ Posiciones cerradas por timeout de conexión");
        } else {
          console.error(`❌ Error al cerrar posiciones: ${result.error}`);
        }
      } catch (error: any) {
        console.error("❌ Error crítico al cerrar posiciones:", error.message);
      }
    }, CONNECTION_TIMEOUT_MS);
  }

  /**
   * Force connection down (for testing)
   */
  forceDisconnect(): void {
    this.handleConnectionLost();
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Start connection monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    console.log("📡 Iniciando monitoreo de conexión...");

    setInterval(() => {
      this.checkConnection();
    }, intervalMs);
  }
}

let connectionManagerInstance: ConnectionManager | null = null;

export function getConnectionManager(
  onRestored?: () => void,
  onLost?: () => void
): ConnectionManager {
  if (!connectionManagerInstance) {
    connectionManagerInstance = new ConnectionManager(onRestored, onLost);
  }
  return connectionManagerInstance;
}

export { ConnectionManager };