import React from 'react';
import { cn } from '@/lib/utils';
import Icon from './icon';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  overlay = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const Spinner = () => (
    <Icon 
      name="Loader2" 
      className={cn('animate-spin', sizeClasses[size])} 
    />
  );

  const Dots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current animate-pulse',
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <div className={cn(
      'rounded bg-current animate-pulse',
      sizeClasses[size]
    )} />
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-2',
      className
    )}>
      {renderVariant()}
      {text && (
        <span className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        )}>
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Готовые варианты для частых случаев
export const LoadingButton: React.FC<{ loading?: boolean; children: React.ReactNode; [key: string]: any }> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => (
  <button 
    {...props} 
    disabled={disabled || loading}
    className={cn(
      'flex items-center justify-center space-x-2',
      props.className
    )}
  >
    {loading && <Loading size="sm" />}
    <span>{children}</span>
  </button>
);

export const LoadingCard: React.FC<{ loading?: boolean; children: React.ReactNode; className?: string }> = ({
  loading = false,
  children,
  className
}) => (
  <div className={cn('relative', className)}>
    {loading && (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <Loading text="Загрузка..." />
      </div>
    )}
    {children}
  </div>
);

export default Loading;