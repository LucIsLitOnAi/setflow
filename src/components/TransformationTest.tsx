"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import testData from '../data/transformation_test.json';
import { PremiumButton } from './PremiumButton';

import { AnimatePresence } from 'framer-motion';

export default function TransformationTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (type: string) => {
    const newAnswers = { ...answers, [testData.questions[currentStep].id]: type };
    setAnswers(newAnswers);
    if (currentStep < testData.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const variants: any = {
    enter: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    center: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[400px] relative max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {showResult ? (
          <motion.div
            key="result"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="glass-warm p-12 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-brand-green/10 text-center shadow-xl"
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
              <h2 className="text-4xl md:text-5xl font-thin text-brand-green mb-10 leading-tight">Dein Ergebnis: <br/><span className="font-medium italic">Fühlen</span></h2>
              <PremiumButton href="https://calendly.com/a-siebel/kostenloses-erstgesprach">Erstgespräch buchen</PremiumButton>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="glass-warm p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-brand-green/10 shadow-xl"
          >
            <h3 className="text-2xl md:text-3xl font-thin text-brand-green mb-12 leading-relaxed">{testData.questions[currentStep].text}</h3>
            <div className="space-y-4">
              {testData.questions[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.type)}
                  className="w-full text-left p-6 md:p-8 rounded-2xl bg-white/40 hover:bg-brand-green hover:text-brand-sand transition-all duration-500 ease-out hover:shadow-lg text-lg font-light border border-transparent hover:border-brand-green/20"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
