import { useState } from 'react';
import { motion } from 'framer-motion';
import TransformationTest from '../components/TransformationTest';
import { BentoGrid } from '../components/BentoGrid';
import { PremiumButton } from '../components/PremiumButton';
import { FullscreenMenu } from '../components/FullscreenMenu';
import { Menu } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-sand">
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass-warm">
        <span className="text-xl font-light tracking-widest text-brand-green uppercase">Anke Siebel</span>
        <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 rounded-full border border-brand-green/10 flex items-center justify-center hover:bg-brand-green hover:text-brand-sand transition-all">
          <Menu size={20} />
        </button>
      </nav>

      <section className="relative pt-40 pb-24 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-sand/40 to-brand-sand z-10" />
          {/* Placeholder for Cinematic Nature Video */}
          <div className="w-full h-full bg-brand-moss/20 object-cover opacity-30" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
            <span className="px-6 py-2 rounded-full border border-brand-green/20 text-sm tracking-widest uppercase mb-8 inline-block glass-warm">Die heilsame Antithese</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-thin text-brand-green mb-6 md:mb-8 leading-[1.1] md:leading-[1.1]">
            Ein geschützter Raum <br className="hidden md:block" />
            <span className="italic opacity-80">für hochsensitive Menschen.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl lg:text-2xl text-brand-green/80 mb-10 md:mb-12 font-light max-w-2xl mx-auto px-4 md:px-0">
            Wärme und Nahbarkeit kombiniert mit High-End-Professionalität. <br className="hidden md:block" /> Krisenintervention & Nervensystem-Regulation in der Einzelbegleitung.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
             <PremiumButton href="#test">Transformationstyp entdecken</PremiumButton>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-brand-sand-dark">
         <div className="max-w-4xl mx-auto text-center mb-16">
           <h2 className="text-4xl font-thin mb-6">Wärme. Klarheit. Tiefe.</h2>
           <p className="text-lg text-brand-green/70">Eine Begleitung, die direkt mit deinem Nervensystem arbeitet und dich aus der Überlastung in die Kraft führt.</p>
         </div>
         <BentoGrid />
      </section>

      <section id="test" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-thin mb-6">Finde deinen Anker.</h2>
          <p className="text-xl text-brand-green/70 font-light">Beantworte zwei einfache Fragen, um herauszufinden, wie dein Nervensystem auf Überlastung reagiert – und wie du zurück in deine Mitte findest.</p>
        </div>
        <TransformationTest />
      </section>

      <footer className="py-12 border-t border-brand-green/10 text-center text-sm text-brand-green/50">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/impressum" className="hover:text-brand-green transition-colors">Impressum</a>
          <a href="/datenschutz" className="hover:text-brand-green transition-colors">Datenschutz</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Anke Siebel. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}
