'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowRight } from 'lucide-react';

export const LandingView = () => {
  const { dispatch } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center text-center space-y-8"
    >
      <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
        Mosaic AI
      </h1>
      <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl">
        Transform your memories into a hyper-personalized masterpiece.
      </p>

      <motion.button
        onClick={() => dispatch({ type: 'SET_STEP', payload: 'quiz_recipient' })}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 flex items-center gap-3 bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-full text-xl font-medium transition-all hover:shadow-lg"
      >
        Start Creating
        <ArrowRight className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
};
