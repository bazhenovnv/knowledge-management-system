import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById("root")!;
const loader = document.getElementById("app-loader");

createRoot(rootElement).render(<App />);

if (loader) {
  loader.remove();
}