
import React, { useState } from 'react';
import { Transaction } from './types';

interface FundViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  friends: string[];
}

export const FundView: React.FC<FundViewProps> = ({ transactions, setTransactions, friends }) => {
  const fundT = transactions.filter(t => t.to === 'FUND');
  const balance = fundT.filter(t => !t.isPaid).reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Fondo <span className="text-emerald-500">Cassa</span></h2>
          <p className="text-slate-500 font-medium">Il tesoro del gruppo per cene, palloni e gloria.</p>
        </div>
        <div className="bg-emerald-500 text-slate-950 px-10 py-6 rounded-3xl shadow-xl shadow-emerald-500/20">
           <p className="text-[10px] font-black uppercase tracking-widest mb-1">Saldo Attuale</p>
           <p className="text-4xl font-black">€{balance.toFixed(2)}</p>
        </div>
      </header>

      <div className="bg-white/5 border border-white/5 p-12 rounded-[4rem]">
         <h3 className="text-2xl font-black uppercase italic mb-10 border-b border-white/5 pb-6">Ultimi Contributi</h3>
         <div className="space-y-4">
            {fundT.length === 0 ? (
              <p className="text-slate-600 italic font-medium">Nessun contributo al momento. Inizia a multare!</p>
            ) : (
              fundT.map(t => (
                <div key={t.id} className="flex justify-between items-center p-8 bg-slate-950/50 border border-white/5 rounded-[2.5rem]">
                   <div>
                      <p className="text-lg font-bold">{t.reason}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">Da: {t.from} • {t.date}</p>
                   </div>
                   <div className="flex items-center space-x-10">
                      <span className="text-2xl font-black text-emerald-400">€{t.amount.toFixed(2)}</span>
                      {!t.isPaid && (
                        <button onClick={() => setTransactions(transactions.map(tr => tr.id === t.id ? {...tr, isPaid: true} : tr))} className="bg-white text-slate-950 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">Saldato</button>
                      )}
                   </div>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  );
};
