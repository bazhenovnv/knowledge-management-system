import React, { forwardRef, useState, useEffect } from 'react';
import { Input, InputProps } from './input';
import { Button } from './button';
import Icon from './icon';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/usePerformance';

interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  debounceMs?: number;
  loading?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch,
    onClear,
    showClearButton = true,
    debounceMs = 300,
    loading = false,
    className,
    ...props 
  }, ref) => {
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, debounceMs);

    useEffect(() => {
      onSearch?.(debouncedValue);
    }, [debouncedValue, onSearch]);

    const handleClear = () => {
      setValue('');
      onClear?.();
    };

    return (
      <div className="relative">
        <Icon 
          name="Search" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" 
        />
        <Input
          ref={ref}
          {...props}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn('pl-10 pr-10', className)}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <Icon name="Loader2" className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {showClearButton && value && !loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              <Icon name="X" className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

interface ValidationInputProps extends InputProps {
  error?: string;
  showError?: boolean;
  success?: boolean;
}

export const ValidationInput = forwardRef<HTMLInputElement, ValidationInputProps>(
  ({ error, showError = true, success, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          {...props}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            success && 'border-green-500 focus-visible:ring-green-500',
            className
          )}
        />
        {showError && error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <Icon name="AlertCircle" className="w-3 h-3" />
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <Icon name="CheckCircle" className="w-3 h-3" />
            Корректно заполнено
          </p>
        )}
      </div>
    );
  }
);

ValidationInput.displayName = 'ValidationInput';

interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number | null) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min, max, step = 1, onChange, ...props }, ref) => {
    const [value, setValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      const numValue = newValue === '' ? null : Number(newValue);
      
      if (numValue !== null && !isNaN(numValue)) {
        if ((min === undefined || numValue >= min) && 
            (max === undefined || numValue <= max)) {
          onChange?.(numValue);
        }
      } else if (newValue === '') {
        onChange?.(null);
      }
    };

    return (
      <Input
        ref={ref}
        {...props}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';