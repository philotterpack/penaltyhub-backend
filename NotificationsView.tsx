
import React, { useEffect, useState } from 'react';
import { Notification, UserProfile, FriendRequest } from './types';

interface NotificationsViewProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: UserProfile | null;
  onAcceptRequest: (reqId: string) => void;
  onRejectRequest: (reqId: string) => void;
  onCancelRequest: (reqId: string) => void;
  onRemoveFriend: (nickname: string) => void;
  onSendRequest: (query: string) => void;
  onJoinGroup: (groupId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  notifications, 
  setNotifications, 
  currentUser, 
  onAcceptRequest, 
  onRejectRequest,
  onCancelRequest,
  onRemoveFriend, 
  onSendRequest, 
  onJoinGroup 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
    
    if (currentUser) {
      const dataKey = `penaltyhub_data_${currentUser.id}`;
      const userData = JSON.parse(localStorage.getItem(dataKey) || '{}');
      setReceivedRequests(userData.friendRequests || []);
      setSentRequests(userData.sentRequests || []);
    }
  }, [currentUser?.id, notifications.length, currentUser?.friendRequests?.length, currentUser?.sentRequests?.length]);

  const clearAll = () => {
    setNotifications([]);
    if (currentUser) {
      const dataKey = `penaltyhub_data_${currentUser.id}`;
      const userData = JSON.parse(localStorage.getItem(dataKey) || '{}');
      userData.notifications = [];
      localStorage.setItem(dataKey, JSON.stringify(userData));
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Social & <span className="text-emerald-500">Alerts</span></h2>
          <p className="text-slate-500 font-medium italic">Area privata di @{currentUser?.nickname}.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
            <div className="flex bg-white/5 p-3 rounded-2xl border border-white/10 flex-1 md:flex-none md:w-80">
                <input 
                    placeholder="Cerca Nickname o #Codice..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent px-3 py-1 text-xs font-bold outline-none italic placeholder:text-slate-700 w-full text-white" 
                />
                <button 
                  onClick={() => { onSendRequest(searchTerm); setSearchTerm(""); }} 
                  className="ml-2 bg-emerald-500 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black uppercase shadow-lg active:scale-95 transition-transform"
                >
                  Cerca
                </button>
            </div>
            <button onClick={clearAll} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors px-4">Svuota</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
            {/* LISTA NOTIFICHE PRINCIPALE */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                    <i className="fas fa-bell mr-3"></i> Notifiche & Inviti
                </h3>
                {notifications.length === 0 && <p className="text-center py-10 text-slate-700 italic font-black uppercase text-[10px] tracking-widest">Nessuna nuova notifica.</p>}
                {notifications.map(n => (
                    <div key={n.id} className={`p-6 rounded-[2rem] border transition-all ${
                      n.type === 'alert' ? 'bg-red-500/5 border-red-500/20' : 
                      n.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 
                      n.type === 'group_invite' ? 'bg-cyan-500/5 border-cyan-500/20' : 
                      n.type === 'friend_request' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' :
                      n.type === 'friend_request_sent' ? 'bg-cyan-500/5 border-cyan-500/20' :
                      'bg-white/5 border-white/5'
                    }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                                  n.type === 'alert' ? 'bg-red-500 text-slate-900' : 
                                  n.type === 'success' ? 'bg-emerald-500 text-slate-900' : 
                                  n.type === 'group_invite' ? 'bg-cyan-500 text-slate-900' : 
                                  n.type === 'friend_request' ? 'bg-emerald-500 text-slate-900' :
                                  n.type === 'friend_request_sent' ? 'bg-cyan-500 text-slate-900' :
                                  'bg-white/10 text-white'
                                }`}>
                                    <i className={`fas ${
                                      n.type === 'alert' ? 'fa-triangle-exclamation' : 
                                      n.type === 'success' ? 'fa-check-double' : 
                                      n.type === 'group_invite' ? 'fa-users-rectangle' : 
                                      n.type === 'friend_request' ? 'fa-user-plus' :
                                      n.type === 'friend_request_sent' ? 'fa-paper-plane' :
                                      'fa-info-circle'
                                    }`}></i>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black uppercase italic tracking-tighter mb-1">{n.title}</h4>
                                    <p className="text-slate-400 font-medium text-[11px] leading-relaxed">{n.message}</p>
                                    <span className="text-[8px] text-slate-600 font-black uppercase block mt-2">{n.date}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              {n.type === 'group_invite' && n.targetId && (
                                  <button 
                                      onClick={() => onJoinGroup(n.targetId!)}
                                      className="bg-cyan-500 text-slate-900 px-6 py-2 rounded-xl text-[8px] font-black uppercase shadow-lg whitespace-nowrap"
                                  >
                                      Unisciti
                                  </button>
                              )}
                              
                              {n.type === 'friend_request' && n.targetId && (
                                  <div className="flex space-x-2">
                                    <button 
                                        onClick={() => onRejectRequest(n.targetId!)}
                                        className="px-4 py-2 border border-red-500/30 text-red-500 rounded-xl text-[8px] font-black uppercase hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                                    >
                                        Rifiuta
                                    </button>
                                    <button 
                                        onClick={() => onAcceptRequest(n.targetId!)}
                                        className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-xl text-[8px] font-black uppercase shadow-lg whitespace-nowrap"
                                    >
                                        Accetta
                                    </button>
                                  </div>
                              )}

                              {n.type === 'friend_request_sent' && n.targetId && (
                                  <button 
                                      onClick={() => onCancelRequest(n.targetId!)}
                                      className="px-4 py-2 border border-slate-700 text-slate-500 rounded-xl text-[8px] font-black uppercase hover:border-red-500 hover:text-red-500 transition-all whitespace-nowrap"
                                  >
                                      Annulla
                                  </button>
                              )}
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </div>

        <div className="space-y-10">
            {/* RICHIESTE IN SOSPESO (RIEPILOGO) */}
            {(receivedRequests.length > 0 || sentRequests.length > 0) && (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                    <i className="fas fa-history mr-3"></i> Stato Amicizie
                </h3>
                <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 space-y-6">
                  {receivedRequests.map(req => (
                    <div key={req.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] uppercase">R</div>
                        <span className="text-xs font-black uppercase italic">@{req.fromNickname}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-emerald-500 italic">Ti ha invitato</span>
                    </div>
                  ))}
                  {sentRequests.map(req => (
                    <div key={req.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-[10px] uppercase">S</div>
                        <span className="text-xs font-black uppercase italic">@{req.toNickname}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-cyan-400 italic">In attesa...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                <i className="fas fa-users mr-3"></i> Amici ({currentUser?.friends.length || 0})
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 min-h-[300px]">
                {currentUser?.friends.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                        <i className="fas fa-user-friends text-4xl mb-4"></i>
                        <p className="text-[10px] font-black uppercase tracking-widest">Aggiungi qualcuno!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {currentUser?.friends.map(friend => (
                            <div key={friend} className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-emerald-400">
                                        {friend[0].toUpperCase()}
                                    </div>
                                    <span className="font-black italic uppercase text-xs">@{friend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
