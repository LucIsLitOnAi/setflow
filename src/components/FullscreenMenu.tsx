import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenMenu({ isOpen, onClose }: FullscreenMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-brand-sand text-brand-green p-8 flex flex-col"
        >
          <div className="flex justify-between items-center mb-16">
             <span className="text-xl font-light tracking-widest uppercase">Anke Siebel</span>
             <button onClick={onClose} className="w-12 h-12 rounded-full border border-brand-green/20 flex items-center justify-center hover:bg-brand-green hover:text-brand-sand transition-all">
               <X size={24} />
             </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center items-center gap-8">
             {['Home', 'Über mich', 'Coaching', 'Dashboard'].map((item, idx) => (
               <motion.div
                 key={item}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 + idx * 0.1 }}
                 className="w-full text-center"
               >
                 <Link
                   to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                   onClick={onClose}
                   className="block text-4xl sm:text-5xl md:text-7xl font-thin hover:italic hover:opacity-70 transition-all py-2"
                 >
                   {item}
                 </Link>
               </motion.div>
             ))}
          </nav>

          <div className="flex justify-between text-sm opacity-50 mt-auto">
            <Link to="/impressum" onClick={onClose} className="hover:opacity-100 transition-opacity">Impressum</Link>
            <Link to="/datenschutz" onClick={onClose} className="hover:opacity-100 transition-opacity">Datenschutz</Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
