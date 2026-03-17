import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import './index.css';
import App from './App';

// Convex client — connects to your deployment
const convexUrl = import.meta.env.VITE_CONVEX_URL;
// Use a fallback URL if not provided to avoid crash, though it won't connect
const convex = new ConvexReactClient(convexUrl || "https://dummy.convex.cloud");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
);
