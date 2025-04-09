'use client';

import { cn } from '@/lib';
import type React from 'react';

export const ElementLayout = ({
  Element,
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  Element: React.ElementType;
  className?: string;
}>) => {
  return <Element className={cn('', className)}>{children}</Element>;
};
