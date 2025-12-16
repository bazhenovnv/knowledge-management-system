import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log('🚀 Starting application...');

const rootElement = document.getElementById("root");
const loader = document.getElementById("app-loader");

if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('✅ Root element found');

// Убираем лоадер
if (loader) {
  loader.remove();
  console.log('✅ Loader removed');
}

// Рендерим приложение
try {
  console.log('🎨 Rendering app...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-center; padding: 20px; font-family: system-ui; background: #0a0a0a; color: white;">
      <div style="max-width: 500px; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">⚠️ Ошибка загрузки приложения</h1>
        <p style="color: #ef4444; margin-bottom: 24px;">${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
        <button onclick="location.reload()" style="padding: 12px 24px; background: white; color: black; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Перезагрузить страницу
        </button>
      </div>
    </div>
  `;
}