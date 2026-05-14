'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon?: React.ReactNode;
  label: string;
  description?: string;
}

export const CardButton = React.forwardRef<HTMLButtonElement, CardButtonProps>(
  ({ className, icon, label, description, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex flex-col items-center justify-center p-6 sm:p-8',
          'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800',
          'border border-gray-200 dark:border-gray-800',
          'rounded-2xl transition-colors duration-200 text-center w-full',
          className
        )}
        {...props}
      >
        {icon && <div className="mb-4 text-gray-800 dark:text-gray-200">{icon}</div>}
        <span className="text-xl sm:text-2xl font-semibold">{label}</span>
        {description && (
          <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </span>
        )}
      </motion.button>
    );
  }
);
CardButton.displayName = 'CardButton';
