import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TransformationTest from '../components/TransformationTest';
import { BentoGrid } from '../components/BentoGrid';
import { PremiumButton } from '../components/PremiumButton';
import { FullscreenMenu } from '../components/FullscreenMenu';
import { Menu } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 250]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-brand-sand">
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass-warm">
        <span className="text-xl font-light tracking-widest text-brand-green uppercase">Anke Siebel</span>
        <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 rounded-full border border-brand-green/10 flex items-center justify-center hover:bg-brand-green hover:text-brand-sand transition-all">
          <Menu size={20} />
        </button>
      </nav>

      <section className="relative pt-48 pb-32 px-6 min-h-[100vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-sand/40 to-brand-sand z-10" />
          <motion.div style={{ y: heroY }} className="w-full h-[120%] -top-[10%] relative bg-brand-moss/15 object-cover opacity-30" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto relative z-10 text-center"
        >
          <motion.div variants={fadeUp} className="mb-10">
            <span className="px-8 py-3 rounded-full border border-brand-green/20 text-xs md:text-sm tracking-[0.2em] uppercase mb-8 inline-block glass-warm">Die heilsame Antithese</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-thin text-brand-green mb-8 md:mb-12">
            Ein geschützter Raum <br className="hidden md:block" />
            <span className="italic opacity-70">für hochsensitive Menschen.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl md:text-2xl lg:text-3xl text-brand-green/80 mb-12 md:mb-16 font-light max-w-3xl mx-auto px-4 md:px-0 leading-relaxed">
            Wärme und Nahbarkeit kombiniert mit High-End-Professionalität. <br className="hidden lg:block" /> Krisenintervention & Nervensystem-Regulation in der Einzelbegleitung.
          </motion.p>

          <motion.div variants={fadeUp}>
             <PremiumButton href="#test">Transformationstyp entdecken</PremiumButton>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-48 px-6 bg-brand-sand-dark relative overflow-hidden">
         <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={staggerContainer}
           className="max-w-5xl mx-auto text-center mb-24"
         >
           <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-thin mb-8">Wärme. Klarheit. Tiefe.</motion.h2>
           <motion.p variants={fadeUp} className="text-xl md:text-2xl text-brand-green/70 font-light max-w-2xl mx-auto leading-relaxed">Eine Begleitung, die direkt mit deinem Nervensystem arbeitet und dich aus der Überlastung in die Kraft führt.</motion.p>
         </motion.div>
         <BentoGrid />
      </section>

      <section id="test" className="py-48 px-6 relative">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={staggerContainer}
           className="max-w-4xl mx-auto text-center mb-24"
        >
          <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-thin mb-8">Finde deinen Anker.</motion.h2>
          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-brand-green/70 font-light leading-relaxed max-w-3xl mx-auto">Beantworte zwei einfache Fragen, um herauszufinden, wie dein Nervensystem auf Überlastung reagiert – und wie du zurück in deine Mitte findest.</motion.p>
        </motion.div>
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
