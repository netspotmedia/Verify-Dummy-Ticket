type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
  error?: Error
}

class Logger {
  private serviceName: string
  private isDevelopment: boolean
  private childContext?: Record<string, unknown>

  constructor(serviceName: string = 'app', childContext?: Record<string, unknown>) {
    this.serviceName  = serviceName
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.childContext  = childContext
  }

  private mergedContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!this.childContext && !context) return undefined
    return { ...this.childContext, ...context }
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): string {
    const timestamp = new Date().toISOString()
    const prefix    = `[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}]`
    let formatted   = `${prefix} ${message}`

    const merged = this.mergedContext(context)
    if (merged && Object.keys(merged).length > 0) {
      formatted += ` | Context: ${JSON.stringify(merged)}`
    }

    if (error) {
      formatted += ` | Error: ${error.message}`
      if (this.isDevelopment) {
        formatted += ` | Stack: ${error.stack}`
      }
    }

    return formatted
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.isDevelopment) return
    console.debug(this.formatMessage('debug', message, context))
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level:     'error',
      message,
      context:   this.mergedContext(context),
      timestamp: new Date().toISOString(),
      error,
    }

    // In production never log full stack traces (may contain PII / paths)
    console.error(this.formatMessage('error', message, context, this.isDevelopment ? error : undefined))

    if (typeof window === 'undefined') {
      process.emitWarning?.(`[LOG] ${JSON.stringify(entry)}`)
    }
  }

  createChild(context: Record<string, unknown>): Logger {
    return new Logger(this.serviceName, { ...this.childContext, ...context })
  }
}

export const logger = new Logger('verify-dummy-ticket')

export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName)
}

export type { LogLevel, LogEntry }
