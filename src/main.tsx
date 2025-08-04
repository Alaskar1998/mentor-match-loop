import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from '@/utils/logger';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.debug('SW registered: ', registration);
      })
      .catch((registrationError) => {
        logger.debug('SW registration failed: ', registrationError);
      });
  });
}

// Add global error handler for development
if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    logger.error('Global error:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Temporarily disable StrictMode to fix development refresh issues
  <App />
)
