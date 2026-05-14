'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';

export const ProgressBar = () => {
  const { state, calculateProgress } = useOnboarding();
  const progress = calculateProgress();

  if (state.currentStep === 'landing') {
    return null; // Don't show progress bar on landing page
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-800 z-50">
      <motion.div
        className="h-full bg-black dark:bg-white"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
};
