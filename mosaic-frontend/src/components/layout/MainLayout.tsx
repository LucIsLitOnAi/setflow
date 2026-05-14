'use client';

import React from 'react';
import { ProgressBar } from './ProgressBar';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <ProgressBar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 w-full max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
};
