import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ClerkProvider } from "@clerk/react";
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!publishableKey || !convexUrl) {
  createRoot(document.getElementById('root')!).render(
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      background: '#0e0e0e',
      color: 'white'
    }}>
      <h1 style={{ color: '#ff4d4d', marginBottom: '16px' }}>Configuration Error</h1>
      <div style={{ background: '#1a1919', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
        {!publishableKey && <p style={{ color: '#ff80ab' }}>❌ <code>VITE_CLERK_PUBLISHABLE_KEY</code> is missing</p>}
        {!convexUrl && <p style={{ color: '#ff80ab' }}>❌ <code>VITE_CONVEX_URL</code> is missing</p>}
      </div>
      <p style={{ marginTop: '24px', opacity: 0.7, maxWidth: '450px', lineHeight: '1.5' }}>
        Please add these environment variables in your <strong>Netlify Dashboard</strong> and trigger a new deploy.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{ marginTop: '24px', padding: '10px 20px', borderRadius: '20px', border: 'none', background: 'white', fontWeight: 600, cursor: 'pointer' }}
      >
        Retry
      </button>
    </div>
  );
} else {
  const convex = new ConvexReactClient(convexUrl);
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <ClerkProvider publishableKey={publishableKey}>
          <BrowserRouter>
            <ConvexProvider client={convex}>
              <App />
            </ConvexProvider>
          </BrowserRouter>
        </ClerkProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
