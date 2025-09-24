import { toast } from "@/components/ui/use-toast";

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  static handleApiError(error: any, customMessage?: string) {
    let message = customMessage || "Произошла ошибка";
    
    if (error?.response?.data?.error) {
      message = error.response.data.error;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    console.error('API Error:', error);
    
    // Возвращаем стандартизированную ошибку
    return {
      message,
      code: error?.response?.status?.toString() || 'UNKNOWN',
      details: error?.response?.data || error
    };
  }

  static showErrorToast(error: ApiError | string, toastFn: any) {
    const message = typeof error === 'string' ? error : error.message;
    
    toastFn({
      title: "Ошибка",
      description: message,
      variant: "destructive"
    });
  }

  static showSuccessToast(message: string, toastFn: any) {
    toastFn({
      title: "Успешно",
      description: message,
      variant: "default"
    });
  }

  static async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    toastFn: any,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<T | null> {
    try {
      const result = await operation();
      
      if (options.successMessage) {
        this.showSuccessToast(options.successMessage, toastFn);
      }
      
      return result;
    } catch (error) {
      const apiError = this.handleApiError(error, options.errorMessage);
      this.showErrorToast(apiError, toastFn);
      return null;
    }
  }
}

// Хук для упрощения использования
export const useErrorHandler = () => {
  const { toast } = toast();
  
  return {
    handleError: (error: any, customMessage?: string) => {
      const apiError = ErrorHandler.handleApiError(error, customMessage);
      ErrorHandler.showErrorToast(apiError, toast);
      return apiError;
    },
    showSuccess: (message: string) => {
      ErrorHandler.showSuccessToast(message, toast);
    },
    handleAsync: <T>(
      operation: () => Promise<T>,
      options: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
      } = {}
    ) => ErrorHandler.handleAsyncOperation(operation, toast, options)
  };
};