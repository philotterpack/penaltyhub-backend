
import React, { useState } from 'react';
import { UserProfile, Group } from './types';

interface FriendsViewProps {
  friends: string[];
  currentUser: UserProfile | null;
  groups: Group[];
  onAddGroup: (name: string, description: string) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddMemberToGroup: (groupId: string, nickname: string) => void;
  onJoinGroup?: (groupId: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ friends, currentUser, groups, onAddGroup, onRenameGroup, onDeleteGroup, onAddMemberToGroup, onJoinGroup }) => {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newMemberNickname, setNewMemberNickname] = useState<{ [groupId: string]: string }>({});

  const handleGroupAction = () => {
      if (editingGroupId) {
          onRenameGroup(editingGroupId, newGroupName);
          setEditingGroupId(null);
      } else {
          onAddGroup(newGroupName, newGroupDesc);
      }
      setIsGroupModalOpen(false);
      setNewGroupName("");
      setNewGroupDesc("");
  };

  const handleAddMember = (groupId: string) => {
    const nick = newMemberNickname[groupId];
    if (!nick) return;
    onAddMemberToGroup(groupId, nick.replace('@', ''));
    setNewMemberNickname(prev => ({ ...prev, [groupId]: "" }));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">I Tuoi <span className="text-emerald-500">Gruppi</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Solo i membri possono vedere match e dettagli interni.</p>
        </div>
        <button onClick={() => { setEditingGroupId(null); setNewGroupName(""); setNewGroupDesc(""); setIsGroupModalOpen(true); }} className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">Nuovo Gruppo</button>
      </header>

      {/* Sezione Gruppi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => {
              const isOwner = group.ownerId === currentUser?.id;
              const isMember = currentUser ? group.members.includes(currentUser.nickname) : false;
              const isInvited = currentUser ? group.pendingInvites.includes(currentUser.nickname) : false;

              return (
                <div key={group.id} className={`bg-[#0c1220] border p-8 rounded-[3rem] relative group/card hover:border-emerald-500/30 transition-all flex flex-col justify-between h-full shadow-lg ${!isMember ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/10'}`}>
                    <div>
                      {isOwner && (
                          <div className="absolute top-6 right-6 flex space-x-4 z-10">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  setEditingGroupId(group.id); 
                                  setNewGroupName(group.name); 
                                  setNewGroupDesc(group.description); 
                                  setIsGroupModalOpen(true); 
                                }} 
                                className="text-slate-500 hover:text-emerald-400 transition-colors"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  if(window.confirm("Sei sicuro di voler eliminare questo gruppo definitivamente? Verranno rimossi anche tutti i match associati.")) {
                                    onDeleteGroup(group.id);
                                  }
                                }} 
                                className="text-slate-500 hover:text-red-500 transition-colors"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                          </div>
                      )}
                      <div className="flex items-center space-x-6 mb-6">
                          <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 text-2xl font-black italic shadow-inner">
                              {group.name[0].toUpperCase()}
                          </div>
                          <div>
                              <h4 className="text-2xl font-black uppercase italic tracking-tighter">{group.name}</h4>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.members.length} Membri</p>
                          </div>
                      </div>
                      <p className="text-slate-400 text-sm font-medium italic mb-6 line-clamp-2">{group.description}</p>
                      
                      {isMember ? (
                        <div className="space-y-4 mb-8">
                           <h5 className="text-[8px] font-black uppercase tracking-widest text-slate-600">Invita Membro</h5>
                           <div className="flex space-x-2">
                             <input 
                               placeholder="@nick..." 
                               className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2 text-[10px] outline-none focus:border-emerald-500 text-white font-bold"
                               value={newMemberNickname[group.id] || ""}
                               onChange={(e) => setNewMemberNickname(prev => ({ ...prev, [group.id]: e.target.value }))}
                             />
                             <button onClick={() => handleAddMember(group.id)} className="bg-white/5 text-emerald-500 w-8 h-8 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all flex items-center justify-center"><i className="fas fa-paper-plane"></i></button>
                           </div>
                        </div>
                      ) : isInvited ? (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-2xl mb-8 text-center animate-pulse-subtle">
                           <p className="text-[10px] font-black uppercase text-cyan-400 mb-4 italic">Sei stato invitato!</p>
                           <button 
                            onClick={() => onJoinGroup && onJoinGroup(group.id)}
                            className="bg-cyan-500 text-slate-900 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20"
                           >
                            Unisciti Ora
                           </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex flex-col space-y-4">
                        <div className="flex -space-x-3 overflow-hidden">
                          {group.members.map((m, i) => (
                              <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#070b14] bg-slate-800 flex items-center justify-center text-[8px] font-black uppercase text-white shadow-xl" title={m}>
                                  {m[0]}
                              </div>
                          ))}
                        </div>
                        {group.pendingInvites.length > 0 && isMember && (
                          <p className="text-[8px] font-black text-slate-600 uppercase italic">Pendenti: {group.pendingInvites.join(', ')}</p>
                        )}
                    </div>
                </div>
              );
          })}
          {groups.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-white/5 rounded-[3.5rem] p-16 text-center opacity-30">
                  <p className="font-black uppercase tracking-[0.3em] text-slate-500">Nessun gruppo visibile.</p>
              </div>
          )}
      </div>

      {/* Modal Creazione/Editing Gruppo */}
      {isGroupModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
              <div className="bg-[#0c1220] border border-white/10 w-full max-w-lg p-12 rounded-[3.5rem] shadow-2xl relative animate-in zoom-in duration-300">
                  <button onClick={() => { setIsGroupModalOpen(false); setEditingGroupId(null); }} className="absolute top-8 right-8 text-slate-500 hover:text-white"><i className="fas fa-times text-xl"></i></button>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-center">{editingGroupId ? 'Modifica' : 'Nuovo'} <span className="text-emerald-500">Gruppo</span></h3>
                  <div className="space-y-4">
                      <input 
                        placeholder="Nome Gruppo (es: Calcetto Lunedì)" 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500 text-white" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                      <textarea 
                        placeholder="Descrizione del gruppo..." 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500 min-h-[120px] text-white" 
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                      />
                  </div>
                  <button onClick={handleGroupAction} className="w-full bg-emerald-500 text-slate-950 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs mt-10 hover:scale-105 transition-all">
                      {editingGroupId ? 'Aggiorna Gruppo' : 'Crea la Squadra'}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
