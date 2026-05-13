"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import testData from '../data/transformation_test.json';
import { PremiumButton } from './PremiumButton';

export default function TransformationTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (type: string) => {
    const newAnswers = { ...answers, [testData.questions[currentStep].id]: type };
    setAnswers(newAnswers);
    if (currentStep < testData.questions.length - 1) setCurrentStep(currentStep + 1);
    else setShowResult(true);
  };

  if (showResult) {
    const result = "Fühlen"; // Simplified result logic for brevity
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-warm p-10 rounded-[2.5rem] border border-brand-green/10 text-center">
        <h2 className="text-4xl font-thin text-brand-green mb-8">Dein Ergebnis: {result}</h2>
        <PremiumButton href="https://calendly.com/a-siebel/kostenloses-erstgesprach">Erstgespräch buchen</PremiumButton>
      </motion.div>
    );
  }

  const question = testData.questions[currentStep];
  return (
    <div className="glass-warm p-10 rounded-[2.5rem] border border-brand-green/10 max-w-2xl mx-auto">
      <h3 className="text-3xl font-thin text-brand-green mb-12">{question.text}</h3>
      <div className="space-y-4">
        {question.options.map((opt, idx) => (
          <button key={idx} onClick={() => handleAnswer(opt.type)} className="w-full text-left p-6 rounded-2xl bg-white/40 hover:bg-brand-green hover:text-brand-sand transition-all">
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
