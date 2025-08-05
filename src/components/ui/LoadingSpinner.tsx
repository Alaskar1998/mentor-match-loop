/**
 * @file LoadingSpinner.tsx
 * @description Reusable loading spinner component
 */

import React from 'react';

/**
 * @interface LoadingSpinnerProps
 * @description Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * @component LoadingSpinner
 * @description Displays a loading spinner with customizable size
 *
 * @param {LoadingSpinnerProps} props - Component props
 * @param {'sm' | 'md' | 'lg'} props.size - Size of the spinner (default: 'md')
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <LoadingSpinner size="lg" className="my-4" />
 */
export const LoadingSpinner = ({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};
