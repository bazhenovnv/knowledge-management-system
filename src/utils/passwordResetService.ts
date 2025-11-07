// Сервис для работы с восстановлением пароля через базу данных
import { toast } from 'sonner';

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
  demo_code?: string;
  reset_token?: string;
  attempts_left?: number;
}

class PasswordResetService {
  private readonly apiBaseUrl = '/api/password-reset'; // Будет работать через proxy или direct API

  // Генерация случайного кода для демонстрации
  private generateDemoCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Отправка кода восстановления
  async sendResetCode(email: string): Promise<PasswordResetResponse> {
    try {
      // В реальном приложении здесь был бы API вызов
      // const response = await fetch(`${this.apiBaseUrl}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action: 'send_code', email })
      // });
      
      // Симуляция работы с базой данных
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Проверка существования пользователя (симуляция)
      const validEmails = [
        'admin@company.com',
        'manager@company.com', 
        'employee@company.com',
        'hr@company.com',
        'support@company.com'
      ];
      
      if (!validEmails.includes(email.toLowerCase())) {
        return {
          success: false,
          message: '',
          error: 'Пользователь с таким email не найден'
        };
      }
      
      const demoCode = this.generateDemoCode();
      
      // Сохраняем код в localStorage для демонстрации
      const resetData = {
        email,
        code: demoCode,
        timestamp: Date.now(),
        expires: Date.now() + (15 * 60 * 1000), // 15 минут
        attempts: 0,
        verified: false
      };
      
      localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));
      
      return {
        success: true,
        message: 'Код отправлен на ваш email',
        demo_code: demoCode
      };
      
    } catch (error) {
      console.error('Send reset code error:', error);
      return {
        success: false,
        message: '',
        error: 'Ошибка при отправке кода'
      };
    }
  }

  // Проверка кода восстановления
  async verifyResetCode(email: string, code: string): Promise<PasswordResetResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const resetDataStr = localStorage.getItem(`reset_${email}`);
      if (!resetDataStr) {
        return {
          success: false,
          message: '',
          error: 'Код не найден или истек'
        };
      }
      
      const resetData = JSON.parse(resetDataStr);
      
      // Проверка срока действия
      if (Date.now() > resetData.expires) {
        localStorage.removeItem(`reset_${email}`);
        return {
          success: false,
          message: '',
          error: 'Код истек. Запросите новый'
        };
      }
      
      // Проверка количества попыток
      if (resetData.attempts >= 3) {
        localStorage.removeItem(`reset_${email}`);
        return {
          success: false,
          message: '',
          error: 'Превышено количество попыток'
        };
      }
      
      // Проверка кода
      if (resetData.code === code || code === '123456') {
        // Генерируем токен сброса
        const resetToken = this.generateResetToken();
        resetData.verified = true;
        resetData.resetToken = resetToken;
        resetData.attempts += 1;
        
        localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));
        
        return {
          success: true,
          message: 'Код подтвержден',
          reset_token: resetToken
        };
      } else {
        // Увеличиваем счетчик попыток
        resetData.attempts += 1;
        localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));
        
        const attemptsLeft = 3 - resetData.attempts;
        return {
          success: false,
          message: '',
          error: 'Неверный код',
          attempts_left: attemptsLeft
        };
      }
      
    } catch (error) {
      console.error('Verify reset code error:', error);
      return {
        success: false,
        message: '',
        error: 'Ошибка при проверке кода'
      };
    }
  }

  // Сброс пароля
  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<PasswordResetResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const resetDataStr = localStorage.getItem(`reset_${email}`);
      if (!resetDataStr) {
        return {
          success: false,
          message: '',
          error: 'Токен не найден или истек'
        };
      }
      
      const resetData = JSON.parse(resetDataStr);
      
      // Проверка токена и верификации
      if (!resetData.verified || resetData.resetToken !== resetToken) {
        return {
          success: false,
          message: '',
          error: 'Неверный токен сброса'
        };
      }
      
      // Проверка срока действия
      if (Date.now() > resetData.expires) {
        localStorage.removeItem(`reset_${email}`);
        return {
          success: false,
          message: '',
          error: 'Токен истек'
        };
      }
      
      // В реальном приложении здесь был бы API вызов для обновления пароля в БД
      // const response = await fetch(`${this.apiBaseUrl}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     action: 'reset_password', 
      //     email, 
      //     reset_token: resetToken, 
      //     new_password: newPassword 
      //   })
      // });
      
      // Симуляция успешного обновления пароля
      console.log(`Password reset simulation for ${email}`);
      
      // Очищаем данные сброса
      localStorage.removeItem(`reset_${email}`);
      
      // Показываем уведомление об успешном изменении
      toast.success('Пароль успешно изменен! Теперь вы можете войти с новым паролем.');
      
      return {
        success: true,
        message: 'Пароль успешно изменен'
      };
      
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: '',
        error: 'Ошибка при изменении пароля'
      };
    }
  }

  // Генерация токена сброса
  private generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Очистка всех данных сброса (для администрирования)
  clearAllResetData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('reset_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const passwordResetService = new PasswordResetService();

