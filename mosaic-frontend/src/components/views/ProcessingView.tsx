'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { Loader2 } from 'lucide-react';

import { useEffect, useState } from 'react';

export const ProcessingView = () => {
  const { state } = useOnboarding();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    let isMounted = true;

    const startMosaicGeneration = async () => {
      try {
        const payload = {
          quiz: state.quiz,
          mainImageId: state.upload.mainImage?.serverId || state.upload.mainImage?.id,
          tileImageIds: state.upload.tileImages.map(img => img.serverId || img.id)
        };

        const res = await fetch('http://localhost:3000/api/style', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (isMounted) {
          if (data.success) {
            setStatus('success');
          } else {
            setStatus('error');
          }
        }
      } catch (e) {
        console.error('Error starting mosaic generation:', e);
        if (isMounted) setStatus('error');
      }
    };

    startMosaicGeneration();

    return () => { isMounted = false; };
  }, [state]);

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center text-center space-y-8"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold">
            Success!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg">
            Your images have been submitted and the AI is working its magic. We will notify you once it&apos;s ready.
          </p>
        </div>
      </motion.div>
    );
  }

  if (status === 'error') {
     return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center text-center space-y-8"
      >
         <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold">
            Oops!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg">
            Something went wrong while submitting your request. Please try again later.
          </p>
        </div>
      </motion.div>
     );
  }

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
