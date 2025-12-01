import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Workaround for rolldown-vite RefreshRuntime issue
if (typeof window !== 'undefined') {
  (window as any).RefreshRuntime = {
    injectIntoGlobalHook: (hook: any) => {},
    getRefreshReg: (filename: string) => (type: any, id: string) => {},
    getRefreshSig: (filename: string) => (type: any) => type,
  };
}

const rootElement = document.getElementById("root")!;
const loader = document.getElementById("app-loader");

createRoot(rootElement).render(<App />);

if (loader) {
  loader.remove();
}