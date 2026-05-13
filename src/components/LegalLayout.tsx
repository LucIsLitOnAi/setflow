import React from 'react';
import { motion } from 'framer-motion';
import { FullscreenMenu } from './FullscreenMenu';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LegalLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-brand-sand">
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass-warm">
        <Link to="/" className="text-xl font-light tracking-widest text-brand-green uppercase">Anke Siebel</Link>
        <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 rounded-full border border-brand-green/10 flex items-center justify-center hover:bg-brand-green hover:text-brand-sand transition-all">
          <Menu size={20} />
        </button>
      </nav>
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
         <motion.h1
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-5xl font-thin text-brand-green mb-16"
         >
           {title}
         </motion.h1>
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="prose prose-lg text-brand-green/80 prose-headings:text-brand-green font-light leading-relaxed"
         >
           {children}
         </motion.div>
      </main>
    </div>
  );
}
