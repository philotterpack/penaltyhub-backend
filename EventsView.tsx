
import React, { useState } from 'react';
import { MatchEvent, Rule, Transaction, Participant, RecurringTemplate, Infraction, UserProfile, RegisteredPlayer, Vote, Group, MatchType } from './types';
import { calculateFinalAmounts } from './logic';

interface EventsViewProps {
  currentUser: UserProfile;
  events: MatchEvent[];
  setEvents: React.Dispatch<React.SetStateAction<MatchEvent[]>>;
  rules: Rule[];
  friends: string[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  transactions: Transaction[];
  templates: RecurringTemplate[];
  onPanicBidone: (eventId: string) => void;
  onCastVote: (eventId: string, vote: Vote) => void;
  onSuggestTeams: (eventId: string) => void;
  groups: Group[];
}

export const EventsView: React.FC<EventsViewProps> = ({ currentUser, events, setEvents, rules, friends, setTransactions, transactions, templates, onPanicBidone, onCastVote, onSuggestTeams, groups }) => {
  const [activeInfractionPlayer, setActiveInfractionPlayer] = useState<{eventId: string, playerId: string} | null>(null);
  const [votingState, setVotingState] = useState<{eventId: string, mvpId: string, lvpId: string} | null>(null);

  const handleRegister = (eventId: string, guests: number) => {
    setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
            const alreadyInIdx = event.registrations.findIndex(r => r.userId === currentUser.id);
            if (alreadyInIdx !== -1) {
                const updated = [...event.registrations];
                updated[alreadyInIdx] = { ...updated[alreadyInIdx], guests };
                return { ...event, registrations: updated };
            }
            const newReg: RegisteredPlayer = { userId: currentUser.id, name: currentUser.name, nickname: currentUser.nickname, timestamp: Date.now(), guests };
            return { ...event, registrations: [...event.registrations, newReg] };
        }
        return event;
    }));
  };

  const reorderRegistration = (eventId: string, index: number, direction: 'up' | 'down') => {
      setEvents(prev => prev.map(e => {
          if (e.id === eventId) {
              const newRegs = [...e.registrations];
              const targetIdx = direction === 'up' ? index - 1 : index + 1;
              if (targetIdx >= 0 && targetIdx < newRegs.length) {
                  [newRegs[index], newRegs[targetIdx]] = [newRegs[targetIdx], newRegs[index]];
              }
              return { ...e, registrations: newRegs };
          }
          return e;
      }));
  };

  const startSession = (eventId: string) => {
    setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
            let activeParticipants: Participant[] = [];
            let currentCount = 0;
            const requiredPlayers = event.matchType * 2;

            for (const reg of event.registrations) {
                if (currentCount < requiredPlayers) {
                    activeParticipants.push({
                        id: reg.userId, userId: reg.userId, name: reg.name, arrivalTime: event.time, goals: 0, nutmegs: 0, postHits: 0, yellowCards: 0, ownGoals: 0, forgotKit: false, isMvp: false, baseQuota: 0, totalFine: 0, finalAmount: 0, infractions: [], team: 'A'
                    });
                    currentCount++;
                    for (let i = 0; i < reg.guests; i++) {
                        if (currentCount < requiredPlayers) {
                            activeParticipants.push({
                                id: `guest-${reg.userId}-${i}`, name: `Ospite di ${reg.nickname}`, arrivalTime: event.time, goals: 0, nutmegs: 0, postHits: 0, yellowCards: 0, ownGoals: 0, forgotKit: false, isMvp: false, baseQuota: 0, totalFine: 0, finalAmount: 0, infractions: [], team: 'B'
                            });
                            currentCount++;
                        }
                    }
                }
            }
            const updatedEvent: MatchEvent = { ...event, status: 'open', participants: activeParticipants, scoreA: 0, scoreB: 0 };
            return { ...updatedEvent, participants: calculateFinalAmounts(updatedEvent, rules) };
        }
        return event;
    }));
  };

  const updateMatchField = (eventId: string, field: keyof MatchEvent, value: any) => {
      setEvents(prev => prev.map(e => {
          if (e.id === eventId) {
            const updated = { ...e, [field]: value };
            if (field === 'matchType') {
                updated.maxParticipants = (value as number) * 2;
            }
            return updated;
          }
          return e;
      }));
  };

  const toggleGlobalRule = (eventId: string, ruleId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const disabledIds = [...e.disabledGlobalRuleIds];
        const idx = disabledIds.indexOf(ruleId);
        if (idx === -1) disabledIds.push(ruleId);
        else disabledIds.splice(idx, 1);
        return { ...e, disabledGlobalRuleIds: disabledIds };
      }
      return e;
    }));
  };

  const handleConfirmResult = (eventId: string) => {
    setEvents(prev => prev.map(e => {
        if (e.id === eventId) {
            if (e.confirmedResult.includes(currentUser.id)) return e;
            return { ...e, confirmedResult: [...e.confirmedResult, currentUser.id] };
        }
        return e;
    }));
  };

  const finalizeMatch = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const participantUserIds = event.participants.map(p => p.userId).filter(id => id && !id.startsWith('guest-'));
    const allConfirmed = participantUserIds.every(id => event.confirmedResult.includes(id as string));
    const allVoted = participantUserIds.every(id => event.votes.some(v => v.voterId === id));

    if (!allConfirmed || !allVoted) {
        alert("Attenzione: Non tutti i partecipanti hanno votato o confermato il risultato!");
        return;
    }

    const transactionsToAdd: Transaction[] = [];
    event.participants.filter(p => p.name !== event.organizer).forEach(p => {
        transactionsToAdd.push({
          id: `m-${event.id}-${p.id}`, ownerId: currentUser.id, from: p.name, to: event.organizer, amount: p.finalAmount, reason: `Match Pro: ${event.matchName}`, date: event.date, isPaid: false
        });
    });

    if (event.fineAllocation === 'fund') {
        const totalFines = event.participants.reduce((acc, p) => acc + p.totalFine, 0);
        if (totalFines > 0) {
            transactionsToAdd.push({ id: `fund-${event.id}`, ownerId: currentUser.id, from: event.organizer, to: 'FUND', amount: totalFines, reason: `Multe Match: ${event.matchName}`, date: event.date, isPaid: false });
        }
    }

    setTransactions([...transactions, ...transactionsToAdd]);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'closed' } : e));
    setVotingState(null);
  };

  const getDayName = (day: number) => ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][day];

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
      <header className="flex justify-between items-center">
         <div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter">Match <span className="text-emerald-500">Pro Log</span></h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 italic">Dettagli match, squadre e statistiche gol.</p>
         </div>
      </header>

      <div className="space-y-16">
        {events.map(event => {
          const isRegistered = event.registrations.some(r => r.userId === currentUser.id);
          const hasVoted = event.votes.some(v => v.voterId === currentUser.id);
          const hasConfirmed = event.confirmedResult.includes(currentUser.id);
          const totalPeople = event.registrations.reduce((acc, r) => acc + 1 + r.guests, 0);
          const associatedGroup = groups.find(g => g.id === event.groupId);
          const requiredPlayers = (event.matchType || 5) * 2;
          const isParticipant = event.participants.some(p => p.userId === currentUser.id);

          return (
            <div key={event.id} className={`bg-[#0c1220] border p-10 rounded-[3rem] relative overflow-hidden transition-all ${event.status === 'closed' ? 'opacity-60 border-white/5' : 'border-emerald-500/20 shadow-2xl'}`}>
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                      <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full italic">PRO_MATCH_{event.id.slice(-4)}</span>
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full italic ${event.status === 'registration' ? 'bg-cyan-500/20 text-cyan-400' : event.status === 'open' ? 'bg-orange-500/20 text-orange-400' : event.status === 'voting' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {event.status === 'registration' ? 'ISCRIZIONI' : event.status === 'open' ? 'MATCH LIVE' : event.status === 'voting' ? 'CONFERME E VOTI' : 'MATCH CHIUSO'}
                      </span>
                  </div>
                  
                  {event.status === 'registration' ? (
                      <div className="space-y-4 mb-6">
                        <input 
                            value={event.matchName} 
                            onChange={(e) => updateMatchField(event.id, 'matchName', e.target.value)}
                            className="bg-transparent text-4xl font-black uppercase italic tracking-tighter outline-none focus:text-emerald-500 w-full"
                            placeholder="Nome Match"
                        />
                        <div className="flex flex-wrap gap-4 items-center">
                            <input 
                                type="date"
                                value={event.date}
                                onChange={(e) => updateMatchField(event.id, 'date', e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 outline-none"
                            />
                            <input 
                                type="time"
                                value={event.time}
                                onChange={(e) => updateMatchField(event.id, 'time', e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 outline-none"
                            />
                            <select 
                                value={event.matchType} 
                                onChange={(e) => updateMatchField(event.id, 'matchType', parseInt(e.target.value))}
                                className="bg-emerald-500 text-slate-900 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none shadow-lg"
                            >
                                <option value={5}>5 vs 5 (10p)</option>
                                <option value={6}>6 vs 6 (12p)</option>
                                <option value={7}>7 vs 7 (14p)</option>
                                <option value={8}>8 vs 8 (16p)</option>
                                <option value={11}>11 vs 11 (22p)</option>
                            </select>
                            <select 
                                value={event.groupId} 
                                onChange={(e) => updateMatchField(event.id, 'groupId', e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 outline-none"
                            >
                                <option value="">Scegli Gruppo...</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>

                        {/* SELEZIONE REGOLE */}
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Regole Attive in questo Match</h5>
                            <div className="flex flex-wrap gap-2">
                                {rules.map(rule => {
                                    const isDisabled = event.disabledGlobalRuleIds.includes(rule.id);
                                    return (
                                        <button 
                                            key={rule.id}
                                            onClick={() => toggleGlobalRule(event.id, rule.id)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${!isDisabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600 border-white/5'}`}
                                        >
                                            {rule.description}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                      </div>
                  ) : (
                      <div className="mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter">{event.matchName}</h3>
                            <p className="text-slate-500 text-xs font-bold italic mt-1">{associatedGroup?.name || 'Gruppo Pro'} @ {event.location} • {event.date} ore {event.time} • Formato {event.matchType}vs{event.matchType}</p>
                          </div>
                          {(event.status === 'open' || event.status === 'voting') && (
                            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 flex items-center space-x-6">
                               <div className="text-center">
                                  <p className="text-[8px] font-black text-slate-600 uppercase mb-1">TEAM A</p>
                                  <input 
                                    type="number" 
                                    className="bg-transparent text-4xl font-black text-emerald-500 w-12 text-center outline-none" 
                                    value={event.scoreA} 
                                    onChange={(e) => updateMatchField(event.id, 'scoreA', parseInt(e.target.value) || 0)}
                                  />
                               </div>
                               <div className="text-2xl font-black italic text-slate-800">:</div>
                               <div className="text-center">
                                  <p className="text-[8px] font-black text-slate-600 uppercase mb-1">TEAM B</p>
                                  <input 
                                    type="number" 
                                    className="bg-transparent text-4xl font-black text-emerald-500 w-12 text-center outline-none" 
                                    value={event.scoreB} 
                                    onChange={(e) => updateMatchField(event.id, 'scoreB', parseInt(e.target.value) || 0)}
                                  />
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                  )}
                </div>

                {event.status === 'registration' && (
                    <div className="flex flex-col items-end space-y-4">
                        <div className="flex space-x-3">
                            <div className="flex bg-slate-900 rounded-2xl p-1 border border-white/5">
                                {[0, 1, 2, 3].map(g => (
                                    <button key={g} onClick={() => handleRegister(event.id, g)} className="px-4 py-2 hover:bg-emerald-500 hover:text-slate-950 rounded-xl text-[9px] font-black uppercase transition-all">
                                        {g === 0 ? 'IO' : `+${g}`}
                                    </button>
                                ))}
                            </div>
                            {isRegistered && (
                                <button onClick={() => onPanicBidone(event.id)} className="bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                    <i className="fas fa-times mr-2"></i> BIDONE
                                </button>
                            )}
                            {event.ownerId === currentUser.id && (
                                <button onClick={() => startSession(event.id)} className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                                    Inizia Ora
                                </button>
                            )}
                        </div>
                        <p className="text-[8px] font-black text-slate-600 uppercase italic">Il match inizierà automaticamente al raggiungimento dell'orario.</p>
                    </div>
                )}
              </div>

              {event.status === 'registration' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-white/5 pt-8">
                      <div>
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black uppercase text-emerald-500 flex items-center">
                                <i className="fas fa-list-ol mr-2"></i> Coda Registrazioni
                            </h4>
                            <div className="flex items-center space-x-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Totale: {totalPeople}</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase">Richiesti: {requiredPlayers}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                              {(() => {
                                  let playersAccumulator = 0;
                                  return event.registrations.map((r, i) => {
                                      const registrationTotal = 1 + r.guests;
                                      const startIdx = playersAccumulator;
                                      playersAccumulator += registrationTotal;
                                      const isStarter = startIdx < requiredPlayers;
                                      return (
                                          <div key={r.userId} className={`flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group ${isStarter ? 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'opacity-40'}`}>
                                              <div className="flex items-center space-x-3">
                                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] uppercase ${isStarter ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>#{i+1}</div>
                                                  <div>
                                                      <span className="text-xs font-black uppercase block">@{r.nickname}</span>
                                                      {r.guests > 0 && <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Porta +{r.guests} Ospiti</span>}
                                                  </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                  {isStarter ? (
                                                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg text-[7px] font-black uppercase italic">Titolare</span>
                                                  ) : (
                                                      <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded-lg text-[7px] font-black uppercase italic">Riserva</span>
                                                  )}
                                              </div>
                                          </div>
                                      );
                                  });
                              })()}
                          </div>
                      </div>
                  </div>
              )}

              {event.status === 'open' && (
                  <div className="space-y-8">
                      <div className="flex space-x-4">
                        <button onClick={() => onSuggestTeams(event.id)} className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center">
                            <i className="fas fa-balance-scale mr-2"></i> Suggerisci Squadre Bilanciate
                        </button>
                        {event.ownerId === currentUser.id && (
                          <button onClick={() => updateMatchField(event.id, 'status', 'voting')} className="bg-purple-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                            Fine Partita
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                          {event.participants.map(p => (
                              <div key={p.id} className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 relative group">
                                  <div className="flex justify-between items-center mb-4">
                                      <span className="font-black italic text-sm uppercase truncate">{p.name}</span>
                                      <select 
                                        value={p.team} 
                                        onChange={(e) => setEvents(events.map(ev => ev.id === event.id ? {...ev, participants: ev.participants.map(part => part.id === p.id ? {...part, team: e.target.value as any} : part)} : ev))}
                                        className={`text-[8px] font-black px-2 py-1 rounded outline-none border-none bg-slate-900 ${p.team === 'A' ? 'text-emerald-400' : 'text-cyan-400'}`}
                                      >
                                        <option value="A">TEAM A</option>
                                        <option value="B">TEAM B</option>
                                      </select>
                                  </div>
                                  <div className="flex justify-between items-center mb-3">
                                      <span className="text-[9px] font-black text-slate-600 uppercase">GOL</span>
                                      <div className="flex items-center space-x-3">
                                          <button onClick={() => setEvents(events.map(ev => ev.id === event.id ? {...ev, participants: ev.participants.map(part => part.id === p.id ? {...part, goals: Math.max(0, part.goals - 1)} : part)} : ev))} className="text-slate-500"><i className="fas fa-minus"></i></button>
                                          <span className="text-xl font-black text-emerald-400">{p.goals}</span>
                                          <button onClick={() => setEvents(events.map(ev => ev.id === event.id ? {...ev, participants: ev.participants.map(part => part.id === p.id ? {...part, goals: part.goals + 1} : part)} : ev))} className="text-slate-500"><i className="fas fa-plus"></i></button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {event.status === 'voting' && (
                <div className="bg-purple-500/5 border border-purple-500/20 p-10 rounded-[3.5rem] animate-in zoom-in duration-300">
                    <h4 className="text-3xl font-black uppercase italic mb-8 text-center text-purple-400">Verifica Risultato e Voti</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 text-center">Conferma Risultato</h5>
                            {isParticipant && (
                                <button 
                                    onClick={() => handleConfirmResult(event.id)}
                                    disabled={hasConfirmed}
                                    className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${hasConfirmed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-slate-950 hover:scale-105'}`}
                                >
                                    {hasConfirmed ? 'RISULTATO CONFERMATO' : 'CONFERMA RISULTATO FINALE'}
                                </button>
                            )}
                            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-600 uppercase mb-4">CONFERME RICEVUTE</p>
                                <div className="flex -space-x-2">
                                    {event.confirmedResult.map(uid => (
                                        <div key={uid} className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[8px] font-black border-2 border-slate-950">✓</div>
                                    ))}
                                    {event.confirmedResult.length === 0 && <span className="text-[10px] text-slate-700 italic">In attesa di conferme...</span>}
                                </div>
                                <p className="text-[9px] font-bold text-slate-500 mt-4 uppercase">{event.confirmedResult.length} di {event.participants.filter(p => p.userId && !p.userId.startsWith('guest-')).length} conferme</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 text-center">Le Tue Pagelle</h5>
                            {!hasVoted && isParticipant ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-[10px] font-black uppercase text-slate-600">Migliore (MVP)</p>
                                        <div className="flex flex-wrap gap-1">
                                            {event.participants.map(p => (
                                                <button key={p.id} onClick={() => setVotingState(prev => ({...prev!, mvpId: p.name, eventId: event.id}))} className={`px-3 py-2 rounded-xl text-[9px] font-black border transition-all ${votingState?.mvpId === p.name ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-white/5 border-white/10 text-slate-400'}`}>{p.name.split(' ')[0]}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-[10px] font-black uppercase text-slate-600">Peggiore (LVP)</p>
                                        <div className="flex flex-wrap gap-1">
                                            {event.participants.map(p => (
                                                <button key={p.id} onClick={() => setVotingState(prev => ({...prev!, lvpId: p.name, eventId: event.id}))} className={`px-3 py-2 rounded-xl text-[9px] font-black border transition-all ${votingState?.lvpId === p.name ? 'bg-red-500 text-slate-900 border-red-500' : 'bg-white/5 border-white/10 text-slate-400'}`}>{p.name.split(' ')[0]}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        disabled={!votingState?.mvpId || !votingState?.lvpId}
                                        onClick={() => { onCastVote(event.id, { voterId: currentUser.id, mvpId: votingState!.mvpId, lvpId: votingState!.lvpId }); setVotingState(null); }}
                                        className="w-full bg-purple-500 py-4 rounded-2xl font-black uppercase text-[10px] disabled:opacity-20"
                                    >Invia Voti</button>
                                </div>
                            ) : hasVoted ? (
                                <div className="p-10 bg-purple-500/10 rounded-3xl border border-purple-500/20 text-center italic text-xs text-purple-400">Voti Inviati! ✓</div>
                            ) : <div className="text-center italic text-slate-600">Solo i partecipanti possono votare.</div>}
                        </div>
                    </div>

                    {event.ownerId === currentUser.id && (
                        <div className="mt-12 text-center border-t border-white/5 pt-10">
                            <button 
                                onClick={() => finalizeMatch(event.id)} 
                                className="bg-emerald-500 text-slate-950 px-12 py-4 rounded-full font-black uppercase text-xs shadow-xl hover:scale-105 transition-all"
                            >
                                Chiudi Match e Salva Statistiche
                            </button>
                            <p className="text-[9px] font-black text-slate-600 uppercase mt-4 italic">Puoi chiudere il match solo dopo che TUTTI hanno confermato e votato.</p>
                        </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
