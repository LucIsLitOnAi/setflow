import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  showArrow?: boolean;
  href?: string;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ children, onClick, className, variant = 'primary', showArrow = true, href }) => {
  const content = (
    <motion.div whileHover="hover" initial="initial" className={cn("relative group cursor-pointer inline-flex items-center gap-3 px-6 py-4 md:px-8 md:py-4 rounded-full font-medium transition-all duration-500 overflow-hidden min-h-[56px] min-w-[200px] justify-center", variant === 'primary' && "bg-brand-green text-brand-sand hover:bg-brand-earth", variant === 'outline' && "border border-brand-green/20 text-brand-green hover:border-brand-green", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <span className="relative z-10 text-sm md:text-base">{children}</span>
      {showArrow && <motion.div variants={{ initial: { x: 0 }, hover: { x: 5 } }} className="relative z-10"><ArrowRight size={18} /></motion.div>}
    </motion.div>
  );
  return href ? <a href={href} className="inline-block">{content}</a> : <button onClick={onClick}>{content}</button>;
};
