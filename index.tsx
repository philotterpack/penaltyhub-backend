
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import { ViewType, MatchEvent, Rule, Bet, Transaction, Participant, RecurringTemplate, UserProfile, Notification, RegisteredPlayer, Vote, FriendRequest, Group } from './types';
import { calculateFinalAmounts, getWeightedStats, suggestBalancedTeams } from './logic';
import { Sidebar } from './Sidebar';
import { DashboardView } from './DashboardView';
import { EventsView } from './EventsView';
import { LedgerView } from './LedgerView';
import { BetsView } from './BetsView';
import { RulesView } from './RulesView';
import { FriendsView } from './FriendsView';
import { TemplatesView } from './TemplatesView';
import { FundView } from './FundView';
import { InfoView } from './InfoView';
import { ProfileView } from './ProfileView';
import { LandingView } from './LandingView';
import { AuthView } from './AuthView';
import { NotificationsView } from './NotificationsView';

const INITIAL_RULES: Rule[] = [
  { id: '1', variable: 'arrival_time', operator: '>', value: '20:00', action: 'add_fixed', actionValue: 1, description: '+1€/min ritardo' },
  { id: '2', variable: 'forgot_kit', operator: '==', value: 'true', action: 'add_fixed', actionValue: 5, description: 'Kit dimenticato' },
  { id: '3', variable: 'yellow_cards', operator: '>', value: '0', action: 'add_fixed', actionValue: 2, description: 'Proteste arbitro' },
  { id: 'heavy_late', variable: 'ritardo_pesante', operator: '>', value: '15', action: 'half_field_penalty', actionValue: 0, description: 'Ritardo Pesante (>15m)', message: 'Hai pagato mezzo campo, la prossima volta dormi lì!' },
  { id: 'paga_doppio_tunnel', variable: 'nutmegs', operator: '>', value: '0', action: 'multiply_quota', actionValue: 2, description: 'Tunnel Subito: PAGA DOPPIO' }
];

const App = () => {
  const [view, setView] = useState<ViewType>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiReport, setAiReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const globalGroups = localStorage.getItem('penaltyhub_global_groups');
    const globalEvents = localStorage.getItem('penaltyhub_global_events');
    if (globalGroups) setGroups(JSON.parse(globalGroups));
    if (globalEvents) setEvents(JSON.parse(globalEvents));
  }, []);

  useEffect(() => {
    localStorage.setItem('penaltyhub_global_groups', JSON.stringify(groups));
    localStorage.setItem('penaltyhub_global_events', JSON.stringify(events));
  }, [groups, events]);

  useEffect(() => {
    const savedUser = localStorage.getItem('penaltyhub_current_session');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const users: UserProfile[] = JSON.parse(localStorage.getItem('penaltyhub_users') || '[]');
      const freshUser = users.find(u => u.id === parsedUser.id);
      if (freshUser) {
        setCurrentUser(freshUser);
        setView('dashboard');
      } else {
        localStorage.removeItem('penaltyhub_current_session');
      }
    }
  }, []);

  // LOAD USER DATA - Crucial fix to load friendRequests and sentRequests
  useEffect(() => {
    if (currentUser) {
      const dataKey = `penaltyhub_data_${currentUser.id}`;
      const savedData = localStorage.getItem(dataKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setRules(parsed.rules || INITIAL_RULES);
        setBets(parsed.bets || []);
        setFriends(parsed.friends || []);
        setTransactions(parsed.transactions || []);
        setNotifications(parsed.notifications || []);
        
        // Update currentUser state with loaded requests if they exist in storage
        if (parsed.friendRequests || parsed.sentRequests) {
          setCurrentUser(prev => prev ? ({
            ...prev,
            friendRequests: parsed.friendRequests || prev.friendRequests || [],
            sentRequests: parsed.sentRequests || prev.sentRequests || []
          }) : null);
        }
      }
    }
  }, [currentUser?.id]);

  // SAVE USER DATA
  useEffect(() => {
    if (currentUser) {
      const dataKey = `penaltyhub_data_${currentUser.id}`;
      localStorage.setItem(dataKey, JSON.stringify({ 
        rules, 
        bets, 
        friends, 
        transactions, 
        notifications,
        friendRequests: currentUser.friendRequests || [],
        sentRequests: currentUser.sentRequests || []
      }));
      localStorage.setItem('penaltyhub_current_session', JSON.stringify(currentUser));
      
      const users: UserProfile[] = JSON.parse(localStorage.getItem('penaltyhub_users') || '[]');
      const updatedUsers = users.map(u => u.id === currentUser.id ? currentUser : u);
      localStorage.setItem('penaltyhub_users', JSON.stringify(updatedUsers));
    }
  }, [rules, bets, friends, transactions, notifications, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('penaltyhub_current_session');
    setCurrentUser(null);
    setRules(INITIAL_RULES);
    setBets([]);
    setFriends([]);
    setTransactions([]);
    setNotifications([]);
    setAiReport("");
    setView('landing');
  };

  const addNotification = (userId: string, title: string, message: string, type: any = 'info', targetId?: string) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      userId,
      title,
      message,
      type,
      targetId,
      date: new Date().toLocaleString(),
      read: false
    };

    if (currentUser && userId === currentUser.id) {
      setNotifications(prev => [newNotif, ...prev]);
    } else {
      const targetDataKey = `penaltyhub_data_${userId}`;
      const targetData = JSON.parse(localStorage.getItem(targetDataKey) || '{}');
      const existingNotifs = targetData.notifications || [];
      targetData.notifications = [newNotif, ...existingNotifs];
      localStorage.setItem(targetDataKey, JSON.stringify(targetData));
    }
  };

  const handleSendFriendRequest = (query: string) => {
    if (!currentUser) return;
    const users: UserProfile[] = JSON.parse(localStorage.getItem('penaltyhub_users') || '[]');
    let targetUser;
    
    const cleanQuery = query.toLowerCase().trim();
    if (cleanQuery.startsWith('#')) {
      targetUser = users.find(u => u.idCode.toLowerCase() === cleanQuery);
    } else {
      targetUser = users.find(u => u.nickname.toLowerCase() === cleanQuery.replace('@', ''));
    }

    if (targetUser) {
      if (targetUser.id === currentUser.id) {
        addNotification(currentUser.id, "Ricerca Errata", "Non puoi inviare una richiesta a te stesso.", 'alert');
        return;
      }

      if (currentUser.friends.includes(targetUser.nickname)) {
        addNotification(currentUser.id, "Già Amici", `${targetUser.nickname} è già nella tua lista amici.`, 'info');
        return;
      }
      
      const req: FriendRequest = {
        id: Date.now().toString(),
        fromUserId: currentUser.id,
        fromNickname: currentUser.nickname,
        toUserId: targetUser.id,
        toNickname: targetUser.nickname,
        status: 'pending',
        date: new Date().toLocaleDateString()
      };
      
      // Save for recipient
      const targetDataKey = `penaltyhub_data_${targetUser.id}`;
      const targetData = JSON.parse(localStorage.getItem(targetDataKey) || '{}');
      const existingRequests = targetData.friendRequests || [];
      targetData.friendRequests = [req, ...existingRequests];
      localStorage.setItem(targetDataKey, JSON.stringify(targetData));

      // Update current user state
      const updatedSent = [req, ...(currentUser.sentRequests || [])];
      setCurrentUser({ ...currentUser, sentRequests: updatedSent });

      addNotification(currentUser.id, "Richiesta Inviata", `Richiesta di amicizia inviata a @${targetUser.nickname}.`, 'friend_request_sent', req.id);
      addNotification(targetUser.id, "Nuova Richiesta", `@${currentUser.nickname} vorrebbe aggiungerti agli amici.`, 'friend_request', req.id);
    } else {
      addNotification(currentUser.id, "Utente non trovato", `Nessun utente corrisponde alla ricerca "${query}"`, 'alert');
    }
  };

  const handleAcceptFriendRequest = (reqId: string) => {
    if (!currentUser) return;
    
    // Find request in currentUser's friendRequests
    const req = (currentUser.friendRequests || []).find(r => r.id === reqId);
    
    if (req) {
      // 1. Update Sender's Data in Storage
      const senderDataKey = `penaltyhub_data_${req.fromUserId}`;
      const senderData = JSON.parse(localStorage.getItem(senderDataKey) || '{}');
      senderData.friends = [...(senderData.friends || []), currentUser.nickname];
      senderData.sentRequests = (senderData.sentRequests || []).filter((r: any) => r.id !== reqId);
      
      // Remove sender's notification about sending the request
      const senderNotifs = senderData.notifications || [];
      senderData.notifications = senderNotifs.filter((n: any) => !(n.type === 'friend_request_sent' && n.targetId === reqId));
      localStorage.setItem(senderDataKey, JSON.stringify(senderData));

      // 2. Update Current User State
      const updatedFriendsList = [...friends, req.fromNickname];
      const updatedFriendRequests = currentUser.friendRequests.filter(r => r.id !== reqId);
      
      setFriends(updatedFriendsList);
      setNotifications(prev => prev.filter(n => !(n.type === 'friend_request' && n.targetId === reqId)));
      setCurrentUser({ 
        ...currentUser, 
        friends: updatedFriendsList,
        friendRequests: updatedFriendRequests
      });

      // 3. Update Global Users Table for consistency
      const users: UserProfile[] = JSON.parse(localStorage.getItem('penaltyhub_users') || '[]');
      const updatedGlobalUsers = users.map(u => {
        if (u.id === req.fromUserId) return { ...u, friends: [...u.friends, currentUser.nickname], sentRequests: (u.sentRequests || []).filter(sr => sr.id !== reqId) };
        if (u.id === currentUser.id) return { ...u, friends: updatedFriendsList, friendRequests: updatedFriendRequests };
        return u;
      });
      localStorage.setItem('penaltyhub_users', JSON.stringify(updatedGlobalUsers));

      // Notifications for both
      addNotification(req.fromUserId, "Richiesta Accettata", `@${currentUser.nickname} ha accettato la tua amicizia!`, 'success');
      addNotification(currentUser.id, "Amicizia Accettata", `Ora sei amico di @${req.fromNickname}!`, 'success');
    }
  };

  const handleRejectFriendRequest = (reqId: string) => {
    if (!currentUser) return;
    const req = (currentUser.friendRequests || []).find(r => r.id === reqId);

    if (req) {
      // Update local state
      const updatedFriendRequests = currentUser.friendRequests.filter(r => r.id !== reqId);
      setCurrentUser({ ...currentUser, friendRequests: updatedFriendRequests });
      setNotifications(prev => prev.filter(n => !(n.type === 'friend_request' && n.targetId === reqId)));

      // Update sender in storage
      const senderDataKey = `penaltyhub_data_${req.fromUserId}`;
      const senderData = JSON.parse(localStorage.getItem(senderDataKey) || '{}');
      senderData.sentRequests = (senderData.sentRequests || []).filter((r: any) => r.id !== reqId);
      const senderNotifs = senderData.notifications || [];
      senderData.notifications = senderNotifs.filter((n: any) => !(n.type === 'friend_request_sent' && n.targetId === reqId));
      localStorage.setItem(senderDataKey, JSON.stringify(senderData));

      addNotification(currentUser.id, "Richiesta Rifiutata", "Hai rifiutato la richiesta di amicizia.", 'info');
    }
  };

  const handleCancelFriendRequest = (reqId: string) => {
    if (!currentUser) return;
    const req = (currentUser.sentRequests || []).find(r => r.id === reqId);

    if (req) {
      // Update local state
      const updatedSentRequests = currentUser.sentRequests.filter(r => r.id !== reqId);
      setCurrentUser({ ...currentUser, sentRequests: updatedSentRequests });
      setNotifications(prev => prev.filter(n => !(n.type === 'friend_request_sent' && n.targetId === reqId)));

      // Update recipient in storage
      const targetDataKey = `penaltyhub_data_${req.toUserId}`;
      const targetData = JSON.parse(localStorage.getItem(targetDataKey) || '{}');
      targetData.friendRequests = (targetData.friendRequests || []).filter((r: any) => r.id !== reqId);
      const targetNotifs = targetData.notifications || [];
      targetData.notifications = targetNotifs.filter((n: any) => !(n.type === 'friend_request' && n.targetId === reqId));
      localStorage.setItem(targetDataKey, JSON.stringify(targetData));

      addNotification(currentUser.id, "Richiesta Annullata", "Hai annullato la richiesta inviata.", 'info');
    }
  };

  const handleInviteMemberToGroup = (groupId: string, nickname: string) => {
    if (!currentUser) return;
    const cleanNick = nickname.replace('@', '').trim();
    const users: UserProfile[] = JSON.parse(localStorage.getItem('penaltyhub_users') || '[]');
    const target = users.find(u => u.nickname.toLowerCase() === cleanNick.toLowerCase());

    if (!target) {
      addNotification(currentUser.id, "Errore", `Utente @${cleanNick} non trovato.`, 'alert');
      return;
    }

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (g.members.includes(cleanNick) || g.pendingInvites.includes(cleanNick)) return g;
        return { ...g, pendingInvites: [...g.pendingInvites, cleanNick] };
      }
      return g;
    }));

    addNotification(currentUser.id, "Invito Inviato", `Hai invitato @${cleanNick} nel gruppo.`, 'success');
    addNotification(target.id, "Invito Gruppo", `${currentUser.nickname} ti ha invitato ad unirti al gruppo "${groups.find(g => g.id === groupId)?.name}"`, 'group_invite', groupId);
  };

  const handleAcceptGroupInvite = (groupId: string) => {
    if (!currentUser) return;
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (!g.pendingInvites.includes(currentUser.nickname)) return g;
        return { 
          ...g, 
          members: [...g.members, currentUser.nickname],
          pendingInvites: g.pendingInvites.filter(n => n !== currentUser.nickname)
        };
      }
      return g;
    }));
    setNotifications(prev => prev.filter(n => !(n.type === 'group_invite' && n.targetId === groupId)));
    addNotification(currentUser.id, "Benvenuto!", "Ora sei un membro ufficiale del gruppo!", 'success');
  };

  const visibleGroups = useMemo(() => {
    if (!currentUser) return [];
    return groups.filter(g => g.members.includes(currentUser.nickname) || g.pendingInvites.includes(currentUser.nickname));
  }, [groups, currentUser?.nickname]);

  const visibleEvents = useMemo(() => {
    if (!currentUser) return [];
    const memberGroupIds = groups.filter(g => g.members.includes(currentUser.nickname)).map(g => g.id);
    return events.filter(e => memberGroupIds.includes(e.groupId));
  }, [events, groups, currentUser?.nickname]);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
  const fullStats = useMemo(() => getWeightedStats(friends, events, transactions).map(s => ({ ...s, bidoneCount: currentUser?.name === s.name ? currentUser.bidoneCount : 0 })), [friends, events, transactions, currentUser]);
  const dashboardStats = useMemo(() => ({
    totalCirculating: transactions.filter(t => !t.isPaid && t.to !== 'FUND').reduce((acc, t) => acc + t.amount, 0),
    fundBalance: transactions.filter(t => t.to === 'FUND' && !t.isPaid).reduce((acc, t) => acc + t.amount, 0),
    matchCount: visibleEvents.length
  }), [transactions, visibleEvents]);

  if (view === 'landing') return <LandingView onNavigate={setView} />;
  if (view === 'auth_login' || view === 'auth_signup') return <AuthView mode={view === 'auth_login' ? 'login' : 'signup'} onAuthSuccess={(user) => { setCurrentUser(user); setView('dashboard'); }} onBack={() => setView('landing')} />;

  const receivedRequestsCount = currentUser ? (currentUser.friendRequests || []).length : 0;
  const unreadCount = notifications.filter(n => !n.read).length + receivedRequestsCount;

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 overflow-hidden font-inter">
      {currentUser && (
        <Sidebar 
          currentView={view} setView={setView} onCreateMatch={() => {
            const myGroups = groups.filter(g => g.members.includes(currentUser.nickname));
            if (myGroups.length === 0) { addNotification(currentUser.id, "Errore", "Unisciti a un gruppo prima di creare match.", 'alert'); return; }
            const id = Date.now().toString();
            const newEvent: MatchEvent = { 
              id, ownerId: currentUser.id, groupId: myGroups[0].id, matchName: 'Match della Settimana', date: new Date().toISOString().split('T')[0], time: '20:00', location: 'Campo Pro', totalCost: 60, maxParticipants: 10, matchType: 5, participants: [], registrations: [], votes: [], confirmedResult: [], eventRules: [], disabledGlobalRuleIds: [], fineAllocation: 'fund', isRecurring: false, status: 'registration', organizer: currentUser.nickname 
            };
            setEvents([newEvent, ...events]);
            setView('events');
          }} 
          profile={currentUser} onLogout={handleLogout} notificationCount={unreadCount}
        />
      )}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-6xl mx-auto pb-24">
          {view === 'dashboard' && <DashboardView stats={dashboardStats} fullStats={fullStats} lastEvent={visibleEvents[0]} aiReport={aiReport} isGenerating={isGenerating} onGenerateRoast={async (event) => {
             setIsGenerating(true);
             try {
               const prompt = `Sei un arbitro sarcastico. Fai un roast del match a "${event.location}". Sii breve e cattivo in italiano. Parla dei bidoni, dei debiti e di chi ha vinto MVP/LVP.`;
               const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
               setAiReport(res.text || "Nessun commento.");
             } catch (e) { setAiReport("Errore AI."); } finally { setIsGenerating(false); }
          }} />}
          {view === 'events' && <EventsView currentUser={currentUser!} events={visibleEvents} setEvents={setEvents} rules={rules} friends={friends} setTransactions={setTransactions} transactions={transactions} templates={templates} onPanicBidone={(id) => {}} onCastVote={(id, v) => {}} onSuggestTeams={(id) => {}} groups={visibleGroups} />}
          {view === 'ledger' && <LedgerView friends={friends} transactions={transactions} setTransactions={setTransactions} />}
          {view === 'fund' && <FundView transactions={transactions} setTransactions={setTransactions} friends={friends} />}
          {view === 'bets' && <BetsView currentUser={currentUser!} bets={bets} setBets={setBets} friends={friends} setTransactions={setTransactions} transactions={transactions} />}
          {view === 'rules' && <RulesView rules={rules} setRules={setRules} />}
          {view === 'friends' && <FriendsView friends={friends} currentUser={currentUser} groups={visibleGroups} onAddGroup={(n, d) => {
            const ng: Group = { id: Date.now().toString(), name: n, ownerId: currentUser!.id, members: [currentUser!.nickname], pendingInvites: [], description: d };
            setGroups([ng, ...groups]);
          }} onRenameGroup={(id, n) => setGroups(groups.map(g => g.id === id ? {...g, name: n} : g))} onDeleteGroup={(id) => {
            setGroups(groups.filter(g => g.id !== id));
            setEvents(events.filter(e => e.groupId !== id));
          }} onAddMemberToGroup={handleInviteMemberToGroup} onJoinGroup={handleAcceptGroupInvite} />}
          {view === 'profile' && currentUser && <ProfileView profile={currentUser} setProfile={setCurrentUser as any} stats={fullStats.find(s => s.name === currentUser.name)} />}
          {view === 'notifications' && <NotificationsView notifications={notifications} setNotifications={setNotifications} currentUser={currentUser} onAcceptRequest={handleAcceptFriendRequest} onRejectRequest={handleRejectFriendRequest} onCancelRequest={handleCancelFriendRequest} onRemoveFriend={(n) => {}} onSendRequest={handleSendFriendRequest} onJoinGroup={handleAcceptGroupInvite} />}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
