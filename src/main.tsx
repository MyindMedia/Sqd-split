import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ClerkProvider } from "@clerk/react";
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('App Initializing...', { 
  hasClerkKey: !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  convexUrl: import.meta.env.VITE_CONVEX_URL 
});

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl || "https://dummy.convex.cloud");

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  createRoot(document.getElementById('root')!).render(
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      background: '#0e0e0e',
      color: 'white'
    }}>
      <h1 style={{ color: '#ff4d4d' }}>Configuration Missing</h1>
      <p>The <code>VITE_CLERK_PUBLISHABLE_KEY</code> is not set.</p>
      <p style={{ opacity: 0.7, maxWidth: '400px' }}>
        Please add your Clerk Publishable Key as an environment variable in your Netlify dashboard.
      </p>
    </div>
  );
} else {
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
