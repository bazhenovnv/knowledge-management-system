import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { createTrackedFetch } from './utils/functionTracker'

window.fetch = createTrackedFetch(window.fetch);

createRoot(document.getElementById("root")!).render(<App />);