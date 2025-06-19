import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Disable React DevTools refresh in development
if (typeof window !== 'undefined') {
  // Prevent automatic page refresh
  window.addEventListener('beforeunload', (e) => {
    // Only prevent if it's an automatic refresh, not user-initiated
    if (e.isTrusted === false) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Disable React Fast Refresh
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      // Do nothing on hot reload
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);