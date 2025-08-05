import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logger } from '@/utils/logger';

// Register service worker for PWA (less aggressive in development)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // In development, only register service worker if explicitly needed
    if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW === 'true') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          logger.debug('SW registered: ', registration);
        })
        .catch(registrationError => {
          logger.debug('SW registration failed: ', registrationError);
        });
    } else {
      logger.debug('Service worker disabled in development mode');
    }
  });
}

// Add global error handler for development
if (import.meta.env.DEV) {
  window.addEventListener('error', event => {
    logger.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', event => {
    logger.error('Unhandled promise rejection:', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
