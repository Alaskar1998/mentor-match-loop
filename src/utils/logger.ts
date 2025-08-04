const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      logger.debug('🔍 ${message}', ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      logger.debug('ℹ️ ${message}', ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    logger.warn('⚠️ ${message}', ...args);
  },
  error: (message: string, ...args: any[]) => {
    logger.error('❌ ${message}', ...args);
  },
  performance: (componentName: string, renderTime: number) => {
    if (isDevelopment && renderTime > 16) {
      logger.warn('🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms');
    }
  },
  search: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      logger.debug('🔍 SEARCH: ${message}', ...args);
    }
  },
  database: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      logger.debug('🗄️ DB: ${message}', ...args);
    }
  },
  notification: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      logger.debug('🔔 NOTIFICATION: ${message}', ...args);
    }
  }
}; 