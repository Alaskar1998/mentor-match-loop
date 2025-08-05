const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🔍 ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
  },
  performance: (componentName: string, renderTime: number) => {
    if (isDevelopment && renderTime > 16) {
      console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  },
  search: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🔍 SEARCH: ${message}`, ...args);
    }
  },
  database: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🗄️ DB: ${message}`, ...args);
    }
  },
  notification: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🔔 NOTIFICATION: ${message}`, ...args);
    }
  }
}; 