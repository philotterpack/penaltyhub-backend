
import React, { useState } from 'react';
import { Bet, Transaction, UserProfile } from './types';

interface BetsViewProps {
  currentUser: UserProfile;
  bets: Bet[];
  setBets: React.Dispatch<React.SetStateAction<Bet[]>>;
  friends: string[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  transactions: Transaction[];
}

export const BetsView: React.FC<BetsViewProps> = ({ currentUser, bets, setBets, friends, setTransactions, transactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBet, setNewBet] = useState<Partial<Bet>>({ participants: [], spiciness: 1 });

  const handleSettle = (bet: Bet, winner: string) => {
    const losers = [bet.proposer, ...bet.participants].filter(n => n !== winner);
    if (bet.monetaryValue) {
      const perLoser = bet.monetaryValue / losers.length;
      // Fix: Added missing ownerId to Transaction object
      const newT: Transaction[] = losers.map(l => ({
        id: `b-${bet.id}-${l}`,
        ownerId: currentUser.id,
        from: l, to: winner, amount: perLoser,
        reason: `Scommessa: ${bet.description}`, date: new Date().toLocaleDateString(), isPaid: false
      }));
      setTransactions([...transactions, ...newT]);
    }
    setBets(bets.map(b => b.id === bet.id ? { ...b, status: 'won', winner } : b));
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-left-8 duration-500">
      <header className="flex justify-between items-center">
        <h2 className="text-5xl font-black uppercase italic tracking-tighter">Sfide <span className="text-emerald-500">Pazzoidi</span></h2>
        <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-emerald-500 text-slate-950 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20">Nuova Scommessa</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {bets.map(bet => (
          <div key={bet.id} className={`bg-white/5 border p-12 rounded-[4rem] relative overflow-hidden transition-all ${bet.status === 'won' ? 'border-emerald-500/30' : 'border-white/5'}`}>
            <div className="flex justify-between items-start mb-10">
              <div className="flex space-x-1">
                {[...Array(bet.spiciness)].map((_, i) => <i key={i} className="fas fa-pepper-hot text-red-500 text-xs"></i>)}
              </div>
              <span className="text-3xl font-black text-emerald-400">€{bet.monetaryValue || 0}</span>
            </div>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-8 leading-tight">{bet.description}</h4>
            <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 flex justify-between items-center mb-8 text-[10px] font-black uppercase tracking-widest">
              <div className="text-center flex-1 border-r border-white/5"><p className="text-slate-500 mb-1">Promoter</p><p>{bet.proposer}</p></div>
              <div className="text-center flex-1"><p className="text-slate-500 mb-1">Premio</p><p className="text-emerald-400">{bet.stake}</p></div>
            </div>
            {bet.status === 'open' ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {[bet.proposer, ...bet.participants].map(n => (
                  <button key={n} onClick={() => handleSettle(bet, n)} className="px-4 py-2 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 rounded-xl text-[9px] font-black uppercase transition-all">Winner: {n}</button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-950/50 rounded-3xl border border-white/5">
                <p className="text-[9px] font-black uppercase text-slate-500 mb-1 tracking-widest">Vincitore Supremo</p>
                <p className="text-xl font-black uppercase text-emerald-400 italic">{bet.winner}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
          <div className="bg-[#0c1220] border border-white/10 w-full max-w-xl p-16 rounded-[4rem] shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><i className="fas fa-times text-2xl"></i></button>
            <div className="text-center mb-10">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">Crea <span className="text-emerald-500">Sfida</span></h3>
            </div>
            <div className="space-y-6">
              <input placeholder="Descrizione (es: Chi fa meno tunnel...)" className="w-full bg-slate-950/50 border border-white/10 rounded-[2.5rem] px-10 py-6 font-black outline-none focus:border-emerald-500" onChange={e => setNewBet({...newBet, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-950/50 border border-white/10 rounded-3xl px-6 py-4 font-bold outline-none" onChange={e => setNewBet({...newBet, proposer: e.target.value})}>
                  <option value="">Proponente...</option>
                  {friends.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <input type="number" placeholder="Valore €" className="bg-slate-950/50 border border-white/10 rounded-3xl px-6 py-4 font-black text-emerald-400" onChange={e => setNewBet({...newBet, monetaryValue: parseFloat(e.target.value)})}/>
              </div>
            </div>
            <button className="w-full bg-emerald-500 text-slate-950 py-8 rounded-[3rem] font-black uppercase tracking-widest text-xs mt-10 hover:scale-105 transition-all shadow-xl" onClick={() => {
              if (!newBet.description || !newBet.proposer) return;
              // Fix: Added missing ownerId to Bet object
              const bet: Bet = {
                id: Date.now().toString(),
                ownerId: currentUser.id,
                description: newBet.description,
                proposer: newBet.proposer,
                participants: friends.filter(f => f !== newBet.proposer),
                stake: (newBet.monetaryValue || 0) + '€',
                stakeCategory: 'money',
                monetaryValue: newBet.monetaryValue || 0,
                spiciness: 1,
                status: 'open'
              };
              setBets([bet, ...bets]);
              setIsModalOpen(false);
            }}>Lancia Sfida</button>
          </div>
        </div>
      )}
    </div>
  );
};
