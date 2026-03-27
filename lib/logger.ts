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

  constructor(serviceName: string = 'app') {
    this.serviceName = serviceName
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}]`
    
    let formatted = `${prefix} ${message}`
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`
      if (this.isDevelopment) {
        formatted += ` | Stack: ${error.stack}`
      }
    }
    
    return formatted
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === 'debug' && !this.isDevelopment) {
      return false
    }
    return true
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message, context))
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return
    
    const entry: LogEntry = {
      level: 'error',
      message,
      context,
      timestamp: new Date().toISOString(),
      error,
    }
    
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, context, error))
    } else {
      console.error(this.formatMessage('error', message, context, undefined))
    }
    
    if (typeof window === 'undefined') {
      process.emitWarning?.(`[LOG] ${JSON.stringify(entry)}`)
    }
  }

  createChild(context: Record<string, unknown>): Logger {
    const child = new Logger(this.serviceName)
    return child
  }
}

export const logger = new Logger('verify-dummy-ticket')

export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName)
}

export type { LogLevel, LogEntry }
