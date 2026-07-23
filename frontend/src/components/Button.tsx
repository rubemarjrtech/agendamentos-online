import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary:
    'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 text-white disabled:bg-blue-400',
  secondary:
    'bg-gray-100 hover:bg-gray-200 focus-visible:ring-gray-400 text-gray-800 disabled:bg-gray-50',
  ghost:
    'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400 text-gray-700 disabled:bg-transparent',
  danger: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 text-white disabled:bg-red-400',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
};

export const Button = ({
  children,
  fullWidth = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => {
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        widthStyle,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
