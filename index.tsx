import React from 'react';
import ReactDOM from 'react-dom/client';
import * as PIXI from 'pixi.js';
(window as any).PIXI = PIXI;
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com'}>
        <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);