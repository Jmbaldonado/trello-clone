'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';
import { useFormStatus } from 'react-dom';

interface FormSubmitProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'destructive'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'primary';
}

export const FormSubmit = ({
  children,
  disabled,
  className,
  variant = 'primary',
}: FormSubmitProps) => {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending || disabled}
      type='submit'
      variant={variant}
      size='sm'
      className={cn(className)}
    >
      {children}
    </Button>
  );
};
