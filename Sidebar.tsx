
import React from 'react';
import { ViewType, UserProfile } from './types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onCreateMatch: () => void;
  profile: UserProfile;
  onLogout: () => void;
  notificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onCreateMatch, profile, onLogout, notificationCount = 0 }) => {
  return (
    <aside className="w-72 glass border-r border-white/5 flex flex-col p-8 space-y-10 sticky top-0 h-screen z-40">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <i className="fas fa-trophy text-slate-900 text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Penalty<span className="text-emerald-400">Hub</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Locker Manager Elite</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-hide">
        {[
          { id: 'dashboard', icon: 'fa-house-chimney', label: 'Home Pro' },
          { id: 'events', icon: 'fa-futbol', label: 'Match Log' },
          { id: 'ledger', icon: 'fa-wallet', label: 'P2P Ledger' },
          { id: 'fund', icon: 'fa-piggy-bank', label: 'Fondo Cassa' },
          { id: 'bets', icon: 'fa-fire-alt', label: 'Scommesse' },
          { id: 'rules', icon: 'fa-scroll', label: 'Il Codice' },
          { id: 'notifications', icon: 'fa-bell', label: 'Notifiche', badge: notificationCount },
          { id: 'friends', icon: 'fa-users', label: 'Gruppi', badge: 0 },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all ${
              currentView === item.id 
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-4">
                <i className={`fas ${item.icon} text-lg w-6`}></i>
                <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
            </div>
            {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-white/5 space-y-4">
        <button 
          onClick={() => setView('profile')}
          className={`w-full flex items-center space-x-4 p-3 rounded-2xl transition-all border ${
            currentView === 'profile' 
              ? 'bg-white/10 border-emerald-500/50' 
              : 'border-transparent hover:bg-white/5'
          }`}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center border border-white/10">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-black text-emerald-400 uppercase">{profile.nickname[0]}</span>
            )}
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-[10px] font-black uppercase text-white truncate">@{profile.nickname}</p>
            <p className="text-[8px] font-bold text-slate-500 truncate">{profile.idCode}</p>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={onLogout}
              className="bg-red-500/10 text-red-500 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              Esci
            </button>
            <button 
              onClick={onCreateMatch}
              className="bg-white text-slate-950 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-emerald-400 transition-all shadow-xl"
            >
              Match
            </button>
        </div>
      </div>
    </aside>
  );
};
