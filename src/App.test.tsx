// Минимальный тест работоспособности приложения

export default function AppTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ React работает!</h1>
        <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '30px' }}>
          Приложение успешно загружено. Если вы видите это сообщение, значит:
        </p>
        <ul style={{ textAlign: 'left', fontSize: '16px', lineHeight: '2' }}>
          <li>✅ React рендерится корректно</li>
          <li>✅ Vite билд работает</li>
          <li>✅ TypeScript компилируется</li>
          <li>✅ Браузер получил актуальный код</li>
        </ul>
        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>
            Версия приложения: 2.0.0<br/>
            Время сборки: {new Date().toLocaleString('ru-RU')}
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/'} 
          style={{ 
            marginTop: '30px',
            padding: '12px 24px', 
            background: 'white', 
            color: 'black', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
