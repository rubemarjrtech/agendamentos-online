import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button = ({ children, fullWidth = false, className = '', ...props }: ButtonProps) => {
  const baseStyles =
    'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button className={`${baseStyles} ${widthStyle} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};
