
import React from 'react';
import { ViewType } from './types';

interface LandingViewProps {
  onNavigate: (view: ViewType) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
          The Ultimate Locker Room Manager
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">
          Penalty<span className="text-emerald-500">Hub</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto italic leading-relaxed">
          Gestisci multe, scommesse e debiti del tuo gruppo con precisione chirurgica. 
          Smetti di rincorrere i debitori, lascia che lo faccia la nostra AI.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
          <button 
            onClick={() => onNavigate('auth_signup')}
            className="w-full md:w-auto px-12 py-6 bg-emerald-500 text-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20"
          >
            Crea Profilo Pro
          </button>
          <button 
            onClick={() => onNavigate('auth_login')}
            className="w-full md:w-auto px-12 py-6 glass text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all border border-white/10"
          >
            Accedi Pro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-24 border-t border-white/5">
          <div className="space-y-4">
            <i className="fas fa-gavel text-3xl text-emerald-500"></i>
            <h3 className="font-black uppercase tracking-widest text-xs">Codice Penale</h3>
            <p className="text-[10px] text-slate-500 leading-loose">Applica sanzioni istantanee per ritardi, kit dimenticati o tunnel subiti.</p>
          </div>
          <div className="space-y-4">
            <i className="fas fa-wallet text-3xl text-cyan-500"></i>
            <h3 className="font-black uppercase tracking-widest text-xs">P2P Ledger</h3>
            <p className="text-[10px] text-slate-500 leading-loose">Traccia ogni centesimo. Bilanci trasparenti tra amici per cene e partite.</p>
          </div>
          <div className="space-y-4">
            <i className="fas fa-ghost text-3xl text-emerald-500"></i>
            <h3 className="font-black uppercase tracking-widest text-xs">AI Roasting</h3>
            <p className="text-[10px] text-slate-500 leading-loose">L'intelligenza artificiale analizza il match e sbeffeggia i debitori cronici.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
