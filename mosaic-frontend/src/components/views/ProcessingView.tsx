'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { Loader2 } from 'lucide-react';

export const ProcessingView = () => {
  const { state } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center space-y-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-16 h-16 text-black dark:text-white" />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-3xl sm:text-4xl font-semibold">
          AI is analyzing your images...
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          We are preparing your {state.quiz.vibe || 'special'} mosaic for {state.quiz.recipient || 'someone'}...
        </p>
      </div>

      <div className="w-full max-w-md mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">Main Subject</span>
          <span className="font-medium">1 Image</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">Mosaic Tiles</span>
          <span className="font-medium">{state.upload.tileImages.length} Images</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Occasion</span>
          <span className="font-medium capitalize">{state.quiz.occasion}</span>
        </div>
      </div>
    </motion.div>
  );
};
