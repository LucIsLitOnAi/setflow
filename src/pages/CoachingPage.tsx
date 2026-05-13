import { LegalLayout } from '../components/LegalLayout';
import { BentoGrid } from '../components/BentoGrid';

export default function CoachingPage() {
  return (
    <LegalLayout title="Coaching & Einzelbegleitung">
      <p className="text-xl mb-12">
        Intensive 1:1 Begleitung für hochsensitive Menschen. Wir arbeiten direkt mit deinem Nervensystem, um nachhaltige Veränderungen zu ermöglichen.
      </p>

      <div className="-mx-6">
        <BentoGrid />
      </div>
    </LegalLayout>
  );
}
