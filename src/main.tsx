import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById("root")!;

// Убираем лоадер сразу
const loader = document.getElementById("app-loader");
if (loader) {
  loader.remove();
}

// Рендерим приложение с обработкой ошибок
try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui;">
      <h1>Ошибка загрузки</h1>
      <p>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
        Перезагрузить страницу
      </button>
    </div>
  `;
}