
import React, { useState } from 'react';
import { Transaction } from './types';

interface LedgerViewProps {
  friends: string[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ friends, transactions, setTransactions }) => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const getBalances = (name: string) => {
    const friendT = transactions.filter(t => !t.isPaid && (t.from === name || t.to === name));
    let debt = 0; let credit = 0;
    friendT.forEach(t => {
      if (t.from === name) debt += t.amount;
      if (t.to === name) credit += t.amount;
    });
    return { debt, credit };
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
      <header>
        <h2 className="text-5xl font-black uppercase italic tracking-tighter">La <span className="text-emerald-500">Cassa</span></h2>
        <p className="text-slate-500 font-medium">Controlla chi deve quanto. Nessun debito dimenticato.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-3">
          {friends.map(f => {
            const { debt, credit } = getBalances(f);
            return (
              <button key={f} onClick={() => setSelectedFriend(f)} className={`w-full p-6 rounded-[2rem] flex justify-between items-center transition-all ${selectedFriend === f ? 'bg-emerald-500 text-slate-950 scale-105 shadow-2xl' : 'bg-white/5 hover:bg-white/10'}`}>
                <span className="font-black uppercase tracking-widest text-xs">{f}</span>
                <span className={`text-sm font-black ${selectedFriend === f ? 'text-slate-950' : (credit >= debt ? 'text-emerald-400' : 'text-red-400')}`}>€{(credit - debt).toFixed(2)}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          {selectedFriend ? (
            <div className="bg-white/5 border p-12 rounded-[4rem] min-h-[500px]">
              <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-8">
                <div>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">Ledger Privato</p>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter">{selectedFriend}</h3>
                </div>
                <div className="flex space-x-8">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-black text-red-500 mb-1">Deve Dare</p>
                    <p className="text-2xl font-black">€{getBalances(selectedFriend).debt.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-black text-emerald-500 mb-1">A Credito</p>
                    <p className="text-2xl font-black">€{getBalances(selectedFriend).credit.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {transactions.filter(t => !t.isPaid && (t.from === selectedFriend || t.to === selectedFriend)).map(t => (
                  <div key={t.id} className={`p-8 rounded-[2.5rem] border flex justify-between items-center ${t.from === selectedFriend ? 'bg-red-500/5 border-red-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                    <div>
                      <p className="font-bold text-lg">{t.reason}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{t.from === selectedFriend ? `A: ${t.to}` : `Da: ${t.from}`} • {t.date}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className={`text-2xl font-black ${t.from === selectedFriend ? 'text-red-400' : 'text-emerald-400'}`}>€{t.amount.toFixed(2)}</span>
                      <button onClick={() => setTransactions(transactions.map(tr => tr.id === t.id ? { ...tr, isPaid: true } : tr))} className="bg-white text-slate-950 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">Salda</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-30 text-slate-400 italic">
              <p className="uppercase tracking-[0.3em] font-black">Seleziona un membro della squadra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
