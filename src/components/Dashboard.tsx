import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import type { Lead } from '../services/leadService';
import { LegalLayout } from './LegalLayout';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    setLeads(leadService.getLeads());
  }, []);

  return (
    <LegalLayout title="Lead Dashboard">
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-brand-green/10">
        <h2 className="text-2xl mb-6">Aktuelle Leads aus dem Transformationstest</h2>

        {leads.length === 0 ? (
          <p className="text-brand-green/50 italic">Noch keine Leads vorhanden.</p>
        ) : (
          <div className="space-y-4">
            {leads.map(lead => (
              <div key={lead.id} className="p-4 bg-white/60 rounded-xl border border-brand-green/5 flex justify-between items-center">
                <div>
                  <span className="font-bold mr-4">{lead.type}</span>
                  <span className="text-sm opacity-50">{new Date(lead.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-sm uppercase tracking-wider">{lead.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LegalLayout>
  );
}
