import React from 'react';
import { toast as originalToast } from '@/components/ui/use-toast';
import Icon from './icon';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

export class EnhancedToast {
  static success(message: string, options?: ToastOptions) {
    return originalToast({
      title: options?.title || "Успешно",
      description: message,
      duration: options?.duration || 3000,
      action: options?.action,
      className: "border-green-200 bg-green-50 text-green-900"
    });
  }

  static error(message: string, options?: ToastOptions) {
    return originalToast({
      title: options?.title || "Ошибка",
      description: message,
      duration: options?.duration || 5000,
      action: options?.action,
      variant: "destructive"
    });
  }

  static warning(message: string, options?: ToastOptions) {
    return originalToast({
      title: options?.title || "Внимание",
      description: message,
      duration: options?.duration || 4000,
      action: options?.action,
      className: "border-orange-200 bg-orange-50 text-orange-900"
    });
  }

  static info(message: string, options?: ToastOptions) {
    return originalToast({
      title: options?.title || "Информация",
      description: message,
      duration: options?.duration || 3000,
      action: options?.action,
      className: "border-blue-200 bg-blue-50 text-blue-900"
    });
  }

  static loading(message: string, options?: ToastOptions) {
    return originalToast({
      title: options?.title || "Загрузка",
      description: (
        <div className="flex items-center gap-2">
          <Icon name="Loader2" className="w-4 h-4 animate-spin" />
          {message}
        </div>
      ),
      duration: options?.duration || 0, // Не исчезает автоматически
      action: options?.action
    });
  }

  static promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    const toastId = this.loading(loading);

    promise
      .then((data) => {
        toastId.dismiss();
        const message = typeof success === 'function' ? success(data) : success;
        this.success(message);
      })
      .catch((err) => {
        toastId.dismiss();
        const message = typeof error === 'function' ? error(err) : error;
        this.error(message);
      });

    return promise;
  }

  static custom(content: React.ReactNode, options?: ToastOptions) {
    return originalToast({
      title: options?.title,
      description: content,
      duration: options?.duration,
      action: options?.action
    });
  }
}

// Hook для использования в компонентах
export const useEnhancedToast = () => {
  return {
    success: EnhancedToast.success,
    error: EnhancedToast.error,
    warning: EnhancedToast.warning,
    info: EnhancedToast.info,
    loading: EnhancedToast.loading,
    promise: EnhancedToast.promise,
    custom: EnhancedToast.custom
  };
};

export default EnhancedToast;