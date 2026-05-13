"use client";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function BentoGrid() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
      } as any}
      className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto px-6 py-24"
    >
      {/* Example Card: Muster lösen */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
        } as any}
        whileHover="hover"
        className="md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-brand-moss p-8 md:p-12 text-brand-sand shadow-2xl cursor-pointer flex flex-col justify-between min-h-[400px]"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-brand-moss to-brand-earth opacity-0 group-hover:opacity-40 transition-opacity duration-700 z-0"
        />
        <motion.div
          variants={{ hover: { scale: 1.05 } }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 bg-brand-moss z-[-1] opacity-50"
        />

        <div className="relative z-10 h-full flex flex-col">
          <Compass size={32} className="mb-8 md:mb-16 opacity-80" />
          <h3 className="text-4xl md:text-6xl font-thin mb-6 md:mb-10">Muster <span className="italic opacity-60">lösen.</span></h3>
          <p className="text-lg md:text-xl font-light mb-8 md:mb-10 max-w-md">10 Sessions intensive Einzelbegleitung direkt mit deinem Nervensystem.</p>
          <div className="mt-auto px-6 py-3 md:px-8 md:py-4 rounded-full border border-brand-sand/20 text-xs md:text-sm uppercase font-bold group-hover:bg-brand-sand group-hover:text-brand-moss group-hover:scale-105 inline-block w-fit transition-all duration-500 ease-out text-center">Paket ansehen</div>
        </div>
      </motion.div>
      {/* Add more cards using glass-warm and glass-moss classes */}
    </motion.section>
  );
}
