'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { LandingView } from './views/LandingView';
import { QuizView } from './views/QuizView';
import { UploadView } from './views/UploadView';
import { ProcessingView } from './views/ProcessingView';

export const FlowController = () => {
  const { state } = useOnboarding();

  switch (state.currentStep) {
    case 'landing':
      return <LandingView />;
    case 'quiz_recipient':
    case 'quiz_vibe':
    case 'quiz_occasion':
      return <QuizView step={state.currentStep} />;
    case 'upload':
      return <UploadView />;
    case 'processing':
      return <ProcessingView />;
    default:
      return <LandingView />;
  }
};
