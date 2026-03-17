import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ClerkProvider } from "@clerk/react";
import './index.css';
import App from './App';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl || "https://dummy.convex.cloud");

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <BrowserRouter>
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
);
