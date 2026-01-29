
import React from 'react';
import { MatchEvent, UserStats } from './types';

interface DashboardProps {
  stats: any;
  fullStats: UserStats[];
  lastEvent?: MatchEvent;
  aiReport: string;
  isGenerating: boolean;
  onGenerateRoast: (event: MatchEvent) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ stats, fullStats, lastEvent, aiReport, isGenerating, onGenerateRoast }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Calcetto <span className="text-emerald-500">Pro Hub</span></h2>
          <p className="text-slate-500 font-medium text-lg mt-2">Dati, gol e umiliazioni in tempo reale.</p>
        </div>
        <div className="flex space-x-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none text-right glass p-6 rounded-3xl border-l-4 border-cyan-500 min-w-[160px] shadow-2xl">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Tesoro di Lega</p>
            <p className="text-3xl font-black text-cyan-400">€{stats.fundBalance.toFixed(2)}</p>
          </div>
          <div className="flex-1 md:flex-none text-right glass p-6 rounded-3xl border-l-4 border-emerald-500 min-w-[160px] shadow-2xl">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Match Giocati</p>
            <p className="text-3xl font-black text-white">{stats.matchCount}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center group hover:border-emerald-500 transition-all">
              <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Capocannoniere</p>
              <h4 className="text-2xl font-black uppercase italic truncate">{[...fullStats].sort((a,b) => b.totalGoals - a.totalGoals)[0]?.name || "---"}</h4>
              <p className="text-emerald-500 font-black text-lg">{[...fullStats].sort((a,b) => b.totalGoals - a.totalGoals)[0]?.totalGoals || 0} GOL</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center group hover:border-purple-500 transition-all">
              <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Most MVP</p>
              <h4 className="text-2xl font-black uppercase italic truncate">{[...fullStats].sort((a,b) => b.mvpCount - a.mvpCount)[0]?.name || "---"}</h4>
              <p className="text-purple-500 font-black text-lg">{[...fullStats].sort((a,b) => b.mvpCount - a.mvpCount)[0]?.mvpCount || 0} TITOLI</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center group hover:border-cyan-500 transition-all">
              <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Win Rate Top</p>
              <h4 className="text-2xl font-black uppercase italic truncate">{[...fullStats].sort((a,b) => b.winRate - a.winRate)[0]?.name || "---"}</h4>
              <p className="text-cyan-400 font-black text-lg">{[...fullStats].sort((a,b) => b.winRate - a.winRate)[0]?.winRate.toFixed(0) || 0}%</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center group hover:border-red-500 transition-all">
              <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Il Più Multato</p>
              <h4 className="text-2xl font-black uppercase italic truncate">{[...fullStats].sort((a,b) => b.totalFines - a.totalFines)[0]?.name || "---"}</h4>
              <p className="text-red-500 font-black text-lg">€{[...fullStats].sort((a,b) => b.totalFines - a.totalFines)[0]?.totalFines.toFixed(2) || 0}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] shadow-inner">
          <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Ranking Affidabilità</h3>
            <i className="fas fa-shield-halved text-emerald-500 text-xl opacity-50"></i>
          </div>
          <div className="space-y-8">
            {[...fullStats].sort((a,b) => b.reliabilityScore - a.reliabilityScore).slice(0, 5).map((u, i) => (
              <div key={u.name} className="space-y-3 group">
                <div className="flex justify-between items-end">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-600 font-black text-xs">0{i+1}</span>
                    <span className="font-black text-xl italic uppercase">@{u.name}</span>
                  </div>
                  <p className="text-emerald-400 font-black text-lg">{u.reliabilityScore.toFixed(0)}%</p>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${u.reliabilityScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {lastEvent && (
          <div className="bg-[#121a2b] border border-white/5 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                     <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Ultimo Risultato</span>
                     <span className="text-slate-500 text-xs font-bold uppercase">{lastEvent.date}</span>
                  </div>
                  <div className="flex justify-center items-center space-x-12 my-10">
                      <div className="text-center">
                          <p className="text-5xl font-black italic">{lastEvent.scoreA || 0}</p>
                          <p className="text-[10px] font-black text-slate-600 uppercase mt-2">Team A</p>
                      </div>
                      <div className="text-3xl font-black opacity-10">VS</div>
                      <div className="text-center">
                          <p className="text-5xl font-black italic">{lastEvent.scoreB || 0}</p>
                          <p className="text-[10px] font-black text-slate-600 uppercase mt-2">Team B</p>
                      </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                    <button 
                      onClick={() => onGenerateRoast(lastEvent)}
                      disabled={isGenerating}
                      className="w-full px-10 py-5 bg-white/5 border border-white/10 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-900 transition-all flex items-center justify-center space-x-3"
                    >
                      {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-ghost"></i>}
                      <span>Genera Analisi Match AI</span>
                    </button>
                    {aiReport && <p className="text-sm text-slate-400 italic bg-slate-950/50 p-6 rounded-2xl border border-white/5 leading-relaxed">"{aiReport}"</p>}
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem]">
          <h3 className="text-xl font-black uppercase italic mb-8 flex items-center">
             <i className="fas fa-ghost text-red-500 mr-4"></i> Hall of Bidoni
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...fullStats].sort((a,b) => b.bidoneCount - a.bidoneCount).slice(0, 6).map(u => (
                  <div key={u.name} className="text-center p-6 bg-slate-950/50 rounded-3xl border border-white/5">
                      <p className="font-black italic uppercase text-xs truncate">{u.name}</p>
                      <p className="text-2xl font-black text-red-500 mt-2">{u.bidoneCount}</p>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">BIDONI</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
