import React from 'react';
import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  clickable?: boolean;
}

const Card = ({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
  clickable = false,
}: CardProps) => {
  const cardClasses = cn(
    'bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden transition-all duration-200',
    {
      'hover:shadow-eco-lg hover:scale-[1.02] hover:-translate-y-1': hover || clickable,
      'cursor-pointer': clickable || onClick,
      // Padding variants
      'p-0': padding === 'none',
      'p-4': padding === 'sm',
      'p-6': padding === 'md',
      'p-8': padding === 'lg',
    },
    className
  );

  const Component = onClick ? 'button' : 'div';

  return (
    <Component className={cardClasses} onClick={onClick}>
      {children}
    </Component>
  );
};

// Card Header component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
};

// Card Title component
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className, 
  as: Component = 'h3' 
}) => {
  return (
    <Component className={cn('text-lg font-semibold text-neutral-900', className)}>
      {children}
    </Component>
  );
};

// Card Content component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('text-neutral-600', className)}>
      {children}
    </div>
  );
};

// Card Footer component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-neutral-100', className)}>
      {children}
    </div>
  );
};

// Export compound component
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card; 