'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OnboardingState, OnboardingAction } from '@/lib/types';

const initialState: OnboardingState = {
  currentStep: 'landing',
  quiz: {
    recipient: null,
    vibe: null,
    occasion: null,
  },
  upload: {
    mainImage: null,
    tileImages: [],
  },
};

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_QUIZ_ANSWER':
      return {
        ...state,
        quiz: {
          ...state.quiz,
          [action.payload.question]: action.payload.answer,
        },
      };
    case 'SET_MAIN_IMAGE':
      return {
        ...state,
        upload: {
          ...state.upload,
          mainImage: action.payload,
        },
      };
    case 'ADD_TILE_IMAGES':
      // Limit to 30 images max
      const currentTilesCount = state.upload.tileImages.length;
      const newTiles = action.payload.slice(0, 30 - currentTilesCount);
      return {
        ...state,
        upload: {
          ...state.upload,
          tileImages: [...state.upload.tileImages, ...newTiles],
        },
      };
    case 'REMOVE_TILE_IMAGE':
      return {
        ...state,
        upload: {
          ...state.upload,
          tileImages: state.upload.tileImages.filter((img) => img.id !== action.payload),
        },
      };
    case 'RESET':
      // cleanup object URLs to prevent memory leaks
      if (state.upload.mainImage) {
        URL.revokeObjectURL(state.upload.mainImage.previewUrl);
      }
      state.upload.tileImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
      return initialState;
    default:
      return state;
  }
};

interface OnboardingContextProps {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  calculateProgress: () => number;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Calculate progress based on state (starts at step 1 quiz)
  const calculateProgress = () => {
    let progress = 0;

    if (state.currentStep === 'landing') return 0;

    // Quiz steps (10% each, total 30%)
    if (state.quiz.recipient) progress += 10;
    if (state.quiz.vibe) progress += 10;
    if (state.quiz.occasion) progress += 10;

    // Upload step
    if (state.currentStep === 'upload' || state.currentStep === 'processing') {
      // Base for reaching upload step is 30% from quiz
      progress = 30;

      // Main image is worth 30%
      if (state.upload.mainImage) {
        progress += 30;
      }

      // Tile images are worth up to 40%
      // 1 tile = minimum to pass, but 30 is max to reach 100%
      const tileCount = state.upload.tileImages.length;
      if (tileCount > 0) {
        progress += Math.min(40, (tileCount / 30) * 40);
      }
    }

    return Math.floor(progress);
  };

  return (
    <OnboardingContext.Provider value={{ state, dispatch, calculateProgress }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
