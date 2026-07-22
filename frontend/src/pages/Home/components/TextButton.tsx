import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className: string; // Aqui tornamos o className obrigatório, sem interrogação (?)
}

export const TextButton = ({ children, className, ...props }: TextButtonProps) => {
  return (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  );
};
