'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { CardButton } from '@/components/ui/CardButton';
import { Step } from '@/lib/types';
import { Heart, Users, User, Sparkles, Smile, Clock, Calendar, Gift, Coffee } from 'lucide-react';

const QUESTIONS = {
  quiz_recipient: {
    title: 'Who is this gift for?',
    options: [
      { id: 'partner', label: 'My Partner', icon: <Heart className="w-8 h-8" /> },
      { id: 'family', label: 'Family', icon: <Users className="w-8 h-8" /> },
      { id: 'friend', label: 'A Friend', icon: <User className="w-8 h-8" /> },
      { id: 'myself', label: 'Myself', icon: <Smile className="w-8 h-8" /> },
    ],
    nextStep: 'quiz_vibe' as Step,
    field: 'recipient' as const,
  },
  quiz_vibe: {
    title: 'What vibe are we going for?',
    options: [
      { id: 'romantic', label: 'Romantic', icon: <Heart className="w-8 h-8" /> },
      { id: 'funny', label: 'Funny', icon: <Smile className="w-8 h-8" /> },
      { id: 'nostalgic', label: 'Nostalgic', icon: <Clock className="w-8 h-8" /> },
      { id: 'cinematic', label: 'Cinematic', icon: <Sparkles className="w-8 h-8" /> },
    ],
    nextStep: 'quiz_occasion' as Step,
    field: 'vibe' as const,
  },
  quiz_occasion: {
    title: 'What is the occasion?',
    options: [
      { id: 'birthday', label: 'Birthday', icon: <Gift className="w-8 h-8" /> },
      { id: 'anniversary', label: 'Anniversary', icon: <Heart className="w-8 h-8" /> },
      { id: 'holiday', label: 'Holiday', icon: <Calendar className="w-8 h-8" /> },
      { id: 'just_because', label: 'Just Because', icon: <Coffee className="w-8 h-8" /> },
    ],
    nextStep: 'upload' as Step,
    field: 'occasion' as const,
  },
};

export const QuizView = ({ step }: { step: 'quiz_recipient' | 'quiz_vibe' | 'quiz_occasion' }) => {
  const { dispatch } = useOnboarding();
  const currentQuestion = QUESTIONS[step];

  const handleSelect = (answerId: string) => {
    // Save answer
    dispatch({
      type: 'SET_QUIZ_ANSWER',
      payload: { question: currentQuestion.field, answer: answerId },
    });

    // Auto-advance to next step
    setTimeout(() => {
      dispatch({ type: 'SET_STEP', payload: currentQuestion.nextStep });
    }, 300); // slight delay for visual feedback
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl flex flex-col items-center"
      >
        <h2 className="text-3xl sm:text-5xl font-semibold mb-12 text-center">
          {currentQuestion.title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
          {currentQuestion.options.map((option) => (
            <CardButton
              key={option.id}
              icon={option.icon}
              label={option.label}
              onClick={() => handleSelect(option.id)}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
