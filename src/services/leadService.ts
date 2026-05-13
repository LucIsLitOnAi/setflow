export interface Lead {
  id: string;
  timestamp: string;
  type: 'Fühlen' | 'Struktur' | 'Tun' | 'Intuition';
  answers: Record<number, string>;
  status: 'new' | 'contacted' | 'booked';
}

const STORAGE_KEY = 'anke_siebel_leads';

export const leadService = {
  saveLead(type: Lead['type'], answers: Lead['answers']) {
    const leads = this.getLeads();
    const newLead: Lead = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type,
      answers,
      status: 'new',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...leads, newLead]));
    return newLead;
  },

  getLeads(): Lead[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  updateLeadStatus(id: string, status: Lead['status']) {
    const leads = this.getLeads();
    const updated = leads.map(l => l.id === id ? { ...l, status } : l);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteLead(id: string) {
    const leads = this.getLeads();
    const filtered = leads.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
