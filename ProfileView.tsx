
import React, { useRef } from 'react';
import { UserProfile, PlayerRole, UserStats } from './types';

interface ProfileViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  stats?: UserStats;
}

const ROLES: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante', 'Universale'];

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, setProfile, stats }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleRole = (role: PlayerRole) => {
    const nextRoles = profile.preferredRoles.includes(role)
      ? profile.preferredRoles.filter(r => r !== role)
      : [...profile.preferredRoles, role];
    setProfile(prev => ({ ...prev, preferredRoles: nextRoles }));
  };

  // Calcolo attributi card
  const pac = stats ? Math.max(30, Math.min(99, stats.reliabilityScore)) : 50;
  const sho = stats ? Math.max(30, Math.min(99, 40 + stats.mvpCount * 10)) : 50;
  const pas = stats ? Math.max(30, Math.min(99, 100 - stats.weightedFineAverage * 10)) : 50;
  const dri = stats ? Math.max(30, Math.min(99, 40 + stats.appearances * 2)) : 50;
  const def = stats ? Math.max(30, Math.min(99, 99 - stats.bidoneCount * 15)) : 50;
  const phy = 85;

  const cardRating = Math.round((pac + sho + pas + dri + def + phy) / 6);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* FIFA CARD SECTION */}
        <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-80 h-[480px] bg-gradient-to-b from-[#f0d87e] via-[#c0a040] to-[#806020] rounded-[2rem] p-1 shadow-2xl overflow-hidden group border border-yellow-400/50">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                
                <div className="relative h-full bg-[#1a1a1a] rounded-[1.8rem] flex flex-col items-center py-8 px-6 text-white border border-yellow-500/30">
                    <div className="absolute top-10 left-8 text-center">
                        <p className="text-5xl font-black italic leading-none">{cardRating}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">{profile.preferredRoles[0]?.slice(0,3).toUpperCase() || 'PRO'}</p>
                    </div>

                    <div className="w-44 h-44 mt-4 bg-slate-800 rounded-full border-4 border-yellow-500/50 overflow-hidden shadow-2xl">
                        {profile.avatar ? (
                            <img src={profile.avatar} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl font-black text-yellow-500 bg-slate-900">{profile.name[0]}</div>
                        )}
                    </div>

                    <h3 className="mt-6 text-2xl font-black italic uppercase tracking-tighter text-yellow-500">{profile.name.split(' ')[0]}</h3>
                    
                    <div className="w-full h-[2px] bg-yellow-500/30 my-6"></div>

                    <div className="grid grid-cols-2 w-full gap-x-8 gap-y-3 font-mono">
                        <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">PAC</span><span className="font-black">{pac}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">DRI</span><span className="font-black">{dri}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">SHO</span><span className="font-black">{sho}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">DEF</span><span className="font-black">{def}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">PAS</span><span className="font-black">{pas}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">PHY</span><span className="font-black">{phy}</span></div>
                    </div>

                    <div className="mt-auto w-full flex justify-center space-x-2">
                        <span className="bg-yellow-500/20 text-yellow-500 text-[8px] font-black px-2 py-1 rounded border border-yellow-500/20">ELITE PLAYER</span>
                        <span className="bg-emerald-500/20 text-emerald-500 text-[8px] font-black px-2 py-1 rounded border border-emerald-500/20">LOYALTY 100</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 text-[10px] font-black uppercase text-slate-500 hover:text-emerald-500 transition-colors"
            >
                Cambia Foto Card
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   const reader = new FileReader();
                   reader.onloadend = () => setProfile(prev => ({ ...prev, avatar: reader.result as string }));
                   reader.readAsDataURL(file);
                 }
            }} />
        </div>

        {/* INFO SECTION */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 relative overflow-hidden">
             <div className="absolute top-10 right-10">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2 rounded-full text-xs font-black italic uppercase tracking-widest">{stats?.title || 'Recluta'}</span>
             </div>
             <div className="space-y-2">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">{profile.name}</h2>
                <p className="text-emerald-400 font-black italic text-xl">@{profile.nickname} <span className="text-slate-600 font-mono text-sm ml-4">#{profile.idCode}</span></p>
             </div>
             <textarea 
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full mt-8 bg-slate-950/30 border border-white/5 rounded-2xl p-6 text-slate-400 font-medium italic focus:border-emerald-500 outline-none min-h-[100px]"
                placeholder="Inserisci un motto..."
             />
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10">
                <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-8">Achievements & Badges</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 relative group">
                        <i className="fas fa-medal text-2xl"></i>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[8px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Socio Onorario Pizzeria</span>
                    </div>
                    <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-500 relative group">
                        <i className="fas fa-clock text-2xl"></i>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[8px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Puntuale come un orologio</span>
                    </div>
                    <div className="w-16 h-16 bg-slate-800 border border-white/5 rounded-2xl flex items-center justify-center text-slate-600">
                        <i className="fas fa-lock text-xl"></i>
                    </div>
                </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10">
                <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-8">Voti della Lega</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-center border border-emerald-500/20">
                        <p className="text-[8px] font-black uppercase text-emerald-500 mb-1">MVP TOT.</p>
                        <p className="text-3xl font-black italic">{stats?.mvpCount || 0}</p>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-2xl text-center border border-red-500/20">
                        <p className="text-[8px] font-black uppercase text-red-500 mb-1">LVP TOT.</p>
                        <p className="text-3xl font-black italic">{stats?.lvpCount || 0}</p>
                    </div>
                </div>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10">
             <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-8">Ruoli Preferiti</h3>
             <div className="flex flex-wrap gap-3">
                {ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      profile.preferredRoles.includes(role)
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xl shadow-emerald-500/20'
                        : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {role}
                  </button>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};
