"use client";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function BentoGrid() {
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto px-6 py-24">
      {/* Example Card: Muster lösen */}
      <motion.div className="md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-brand-moss p-8 md:p-12 text-brand-sand shadow-2xl cursor-pointer flex flex-col justify-between min-h-[400px]">
        <div className="relative z-10 h-full flex flex-col">
          <Compass size={32} className="mb-8 md:mb-16" />
          <h3 className="text-4xl md:text-6xl font-thin mb-6 md:mb-10">Muster <span className="italic opacity-60">lösen.</span></h3>
          <p className="text-lg md:text-xl font-light mb-8 md:mb-10">10 Sessions intensive Einzelbegleitung direkt mit deinem Nervensystem.</p>
          <div className="mt-auto px-6 py-3 md:px-8 md:py-4 rounded-full border border-brand-sand/20 text-xs md:text-sm uppercase font-bold hover:bg-brand-sand hover:text-brand-moss inline-block w-fit transition-all text-center">Paket ansehen</div>
        </div>
      </motion.div>
      {/* Add more cards using glass-warm and glass-moss classes */}
    </motion.section>
  );
}
