import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Boot succeeded: clear the stale-asset reload guard set in index.html.
try {
  sessionStorage.removeItem('pb-reloaded');
} catch {
  /* ignore */
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Framer Motion disables transform/layout animations when the OS asks for reduced motion. */}
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ErrorBoundary>
  </React.StrictMode>,
);
