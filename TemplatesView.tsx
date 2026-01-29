
import React, { useState } from 'react';
import { RecurringTemplate, UserProfile } from './types';

interface TemplatesViewProps {
  currentUser: UserProfile;
  templates: RecurringTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<RecurringTemplate[]>>;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ currentUser, templates, setTemplates }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newT, setNewT] = useState<Partial<RecurringTemplate>>({ frequency: 'weekly' });

  const handleAddTemplate = () => {
    if (!newT.name || !newT.defaultCost) return;
    // Fix: Added missing ownerId to RecurringTemplate object
    const template: RecurringTemplate = {
      id: Date.now().toString(),
      ownerId: currentUser.id,
      name: newT.name,
      defaultLocation: newT.defaultLocation || 'TBD',
      defaultCost: newT.defaultCost,
      frequency: newT.frequency as any,
      description: newT.description || 'Nessuna descrizione.'
    };
    setTemplates([...templates, template]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Event <span className="text-emerald-400">Templates</span></h2>
          <p className="text-slate-500 font-medium italic">Standardizza le tue convocazioni Pro.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all">
          Nuovo Modello
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] relative group hover:border-emerald-500/30 transition-all flex flex-col justify-between">
             <div>
               <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/5 shadow-inner">
                     <i className="fas fa-calendar-check text-xl"></i>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest">{t.frequency}</span>
               </div>
               <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter leading-none">{t.name}</h3>
               <p className="text-slate-500 font-bold text-xs mb-8">{t.description}</p>
             </div>
             
             <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-600 tracking-widest">Location</span><span className="text-slate-300">{t.defaultLocation}</span></div>
                <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-600 tracking-widest">Costo Base</span><span className="text-emerald-400">€{t.defaultCost}</span></div>
             </div>
          </div>
        ))}
        <div onClick={() => setIsModalOpen(true)} className="border-4 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center p-12 opacity-30 hover:opacity-100 transition-all cursor-pointer group">
           <i className="fas fa-magic text-3xl mb-4 group-hover:scale-125 transition-transform text-cyan-400"></i>
           <p className="uppercase font-black text-xs tracking-widest">Crea Formato</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
          <div className="bg-[#0c1220] border border-white/10 w-full max-w-xl p-12 rounded-[3.5rem] shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><i className="fas fa-times text-xl"></i></button>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-center">Nuovo <span className="text-emerald-500">Modello</span></h3>
            
            <div className="space-y-4">
              <input placeholder="Nome Modello (es: Calcetto del Lunedì)" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500" onChange={e => setNewT({...newT, name: e.target.value})} />
              <input placeholder="Location di default" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500" onChange={e => setNewT({...newT, defaultLocation: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none" onChange={e => setNewT({...newT, frequency: e.target.value as any})}>
                  <option value="weekly">Settimanale</option>
                  <option value="bi-weekly">Ogni 2 settimane</option>
                  <option value="monthly">Mensile</option>
                  <option value="custom">Saltuario</option>
                </select>
                <input type="number" placeholder="Costo Totale (€)" className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none text-emerald-400" onChange={e => setNewT({...newT, defaultCost: parseFloat(e.target.value)})}/>
              </div>
              <textarea placeholder="Breve descrizione..." className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500 min-h-[100px]" onChange={e => setNewT({...newT, description: e.target.value})}></textarea>
            </div>

            <button onClick={handleAddTemplate} className="w-full bg-white text-slate-950 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs mt-10 hover:bg-emerald-400 transition-all">
              Configura Modello
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
