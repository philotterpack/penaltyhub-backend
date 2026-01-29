
import React from 'react';

export const InfoView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700 max-w-4xl mx-auto">
      <header className="text-center mb-16">
        <h2 className="text-7xl font-black uppercase italic tracking-tighter mb-4">Istruzioni <span className="text-emerald-500">Pro</span></h2>
        <p className="text-slate-500 font-medium text-xl">Benvenuto nel sistema definitivo per la gestione dello spogliatoio.</p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {/* Sezione 1: Logica Match */}
        <section className="bg-white/5 border border-white/10 rounded-[4rem] p-12 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 blur-[100px]"></div>
          <div className="flex items-center space-x-6 mb-8 border-b border-white/5 pb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-slate-900 text-3xl shadow-xl shadow-emerald-500/20">
              <i className="fas fa-futbol"></i>
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Gestione Match Log</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-slate-400 font-medium leading-relaxed">
            <div className="space-y-4">
              <p><span className="text-emerald-400 font-black">Creazione Evento:</span> Usa il tasto "Nuovo Match" per avviare una sessione. Puoi usare modelli predefiniti per risparmiare tempo.</p>
              <p><span className="text-emerald-400 font-black">Sanzioni in Tempo Reale:</span> Durante il match, seleziona i partecipanti e clicca sull'icona "+" per infliggere multe basate sul Codice Penale o regole locali.</p>
            </div>
            <div className="space-y-4">
              <p><span className="text-emerald-400 font-black">Codice Match:</span> Puoi attivare o disattivare le regole globali solo per quel match, o aggiungerne di nuove (es. "Chi sbaglia il rigore paga 2€").</p>
              <p><span className="text-emerald-400 font-black">Allocazione Multe:</span> Scegli se le multe scontano la quota di chi è stato "pulito" (Bonus Bravi) o se finiscono nel fondo cassa comune.</p>
            </div>
          </div>
        </section>

        {/* Sezione 2: Economia e Cassa */}
        <section className="bg-white/5 border border-white/10 rounded-[4rem] p-12 relative overflow-hidden group">
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/5 blur-[100px]"></div>
          <div className="flex items-center space-x-6 mb-8 border-b border-white/5 pb-8">
            <div className="w-16 h-16 bg-cyan-500 rounded-3xl flex items-center justify-center text-slate-900 text-3xl shadow-xl shadow-cyan-500/20">
              <i className="fas fa-wallet"></i>
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Economia della Squadra</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-12 text-slate-400 font-medium leading-relaxed">
            <div className="space-y-4">
               <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">P2P Ledger</h4>
               <p>Il sistema traccia automaticamente i debiti verso l'organizzatore del match. Entra nel Ledger per vedere il bilancio individuale e segnare come "Saldato" un pagamento effettuato.</p>
            </div>
            <div className="space-y-4">
               <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Fondo Cassa</h4>
               <p>Accumula i capitali per cene di squadra o nuovi palloni. Le multe segnate come "Versa nel Fondo" verranno visualizzate qui una volta che il match è finalizzato.</p>
            </div>
          </div>
        </section>

        {/* Sezione 3: Scommesse e Codice */}
        <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-950/50 border border-white/5 rounded-[3.5rem] p-10">
                <i className="fas fa-fire-alt text-red-500 text-2xl mb-6"></i>
                <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4">Scommesse Social</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Lancia sfide ai tuoi amici (es: "Chi segna meno paga una birra"). Se la scommessa ha un valore monetario, il debito verrà aggiunto automaticamente al Ledger del vincitore.</p>
            </div>
            <div className="bg-slate-950/50 border border-white/5 rounded-[3.5rem] p-10">
                <i className="fas fa-scroll text-emerald-500 text-2xl mb-6"></i>
                <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4">Il Codice Penale</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Definisci le regole universali della tua lega. Puoi impostare multe fisse (es: 5€ per kit dimenticato) o moltiplicatori (es: "Paga Doppio" o "MVP Gratis").</p>
            </div>
        </section>

        {/* Sezione 4: AI Insights */}
        <section className="bg-emerald-500 text-slate-950 rounded-[4rem] p-12 text-center shadow-2xl shadow-emerald-500/20">
            <i className="fas fa-ghost text-4xl mb-6"></i>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none">AI Match Roast</h3>
            <p className="text-lg font-bold max-w-2xl mx-auto opacity-80">Al termine di ogni match, usa l'Intelligenza Artificiale per generare un'analisi spietata e sarcastica dello spogliatoio. L'arbitro virtuale non avrà pietà per chi ha pagato più multe!</p>
        </section>
      </div>

      <footer className="text-center py-12 border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">PenaltyPro v2.5 • Developed for Elite Players</p>
      </footer>
    </div>
  );
};
