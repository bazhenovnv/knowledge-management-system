import { cn } from '@/lib/utils';
import Icon from './icon';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
  overlay?: boolean;
}

export const Loading = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  overlay = false
}: LoadingProps) => {
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

export default Loading;