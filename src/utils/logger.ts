// Simple logging utility for trading actions

type LogLevel = "INFO" | "WARN" | "ERROR" | "TRADE" | "DEBUG";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with emoji prefix
    const prefix = this.getPrefix(level);
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
    console.log(`${prefix} ${message}${dataStr}`);
  }

  private getPrefix(level: LogLevel): string {
    switch (level) {
      case "INFO":
        return "ℹ️";
      case "WARN":
        return "⚠️";
      case "ERROR":
        return "❌";
      case "TRADE":
        return "💰";
      case "DEBUG":
        return "🔍";
      default:
        return "📝";
    }
  }

  info(message: string, data?: any): void {
    this.log("INFO", message, data);
  }

  warn(message: string, data?: any): void {
    this.log("WARN", message, data);
  }

  error(message: string, data?: any): void {
    this.log("ERROR", message, data);
  }

  trade(message: string, data?: any): void {
    this.log("TRADE", message, data);
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG === "true") {
      this.log("DEBUG", message, data);
    }
  }

  // Trade-specific logging
  logOrderOpened(order: any): void {
    this.trade("Orden abierta", {
      side: order.side,
      quantity: order.quantity,
      entryPrice: order.entryPrice,
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
    });
  }

  logOrderClosed(order: any, reason: string): void {
    this.trade(`Orden cerrada (${reason})`, {
      pnl: order.pnl,
      entryPrice: order.entryPrice,
      closedAt: order.closedAt,
    });
  }

  logSignal(signal: string, details: any): void {
    this.trade(`Señal: ${signal}`, details);
  }

  // Get recent logs
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((l) => l.level === level);
  }

  // Clear logs
  clear(): void {
    this.logs = [];
  }
}

// Singleton instance
const logger = new Logger();

export { logger, Logger, LogLevel, LogEntry };
export default logger;