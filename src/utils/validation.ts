export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class Validator {
  private rules: Record<string, ValidationRule> = {};
  private errors: ValidationError[] = [];

  addRule(field: string, rule: ValidationRule) {
    this.rules[field] = rule;
    return this;
  }

  validate(data: Record<string, any>): ValidationError[] {
    this.errors = [];

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(field, value, rule);
      if (error) {
        this.errors.push(error);
      }
    }

    return this.errors;
  }

  isValid(data: Record<string, any>): boolean {
    return this.validate(data).length === 0;
  }

  private validateField(field: string, value: any, rule: ValidationRule): ValidationError | null {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return { field, message: 'Это поле обязательно для заполнения' };
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return { field, message: `Минимальная длина: ${rule.minLength} символов` };
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return { field, message: `Максимальная длина: ${rule.maxLength} символов` };
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return { field, message: 'Неверный формат' };
      }

      if (rule.email && !this.isValidEmail(value)) {
        return { field, message: 'Неверный формат email' };
      }

      if (rule.phone && !this.isValidPhone(value)) {
        return { field, message: 'Неверный формат телефона' };
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return { field, message: customError };
      }
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
    return phonePattern.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}

// Готовые валидаторы для частых случаев
export const validators = {
  required: (): ValidationRule => ({ required: true }),
  
  email: (): ValidationRule => ({ 
    required: true, 
    email: true 
  }),
  
  phone: (): ValidationRule => ({ 
    phone: true 
  }),
  
  password: (): ValidationRule => ({ 
    required: true, 
    minLength: 6,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/
  }),
  
  name: (): ValidationRule => ({ 
    required: true, 
    minLength: 2, 
    maxLength: 50,
    pattern: /^[а-яА-Яa-zA-Z\s\-]+$/
  }),

  testTitle: (): ValidationRule => ({
    required: true,
    minLength: 3,
    maxLength: 100
  }),

  testQuestion: (): ValidationRule => ({
    required: true,
    minLength: 10,
    maxLength: 500
  })
};

// Хук для использования в компонентах
export const useValidation = () => {
  const createValidator = () => new Validator();
  
  const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>) => {
    const validator = new Validator();
    
    for (const [field, rule] of Object.entries(rules)) {
      validator.addRule(field, rule);
    }
    
    return validator.validate(data);
  };

  return {
    createValidator,
    validateForm,
    validators
  };
};