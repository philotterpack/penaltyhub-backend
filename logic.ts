
import { MatchEvent, Rule, Participant, Transaction, UserStats } from './types';

export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const calculateFinalAmounts = (event: MatchEvent, globalRules: Rule[]): Participant[] => {
  if (event.participants.length === 0) return [];
  
  const activeGlobalRules = globalRules.filter(r => !event.disabledGlobalRuleIds.includes(r.id));
  const allRules = [...activeGlobalRules, ...event.eventRules];
  const baseShare = event.totalCost / event.participants.length;
  
  let updatedParticipants = event.participants.map(p => {
    let totalFine = 0;
    let multiplier = 1;
    
    p.infractions.forEach(inf => {
      const activeRule = allRules.find(r => r.id === inf.ruleId);
      if (activeRule) {
        if (activeRule.action === 'multiply_quota') {
            multiplier *= activeRule.actionValue;
        } else if (activeRule.action === 'half_field_penalty') {
            totalFine += activeRule.actionValue + (event.totalCost * 0.5);
        } else {
            totalFine += inf.calculatedAmount;
        }
      }
    });

    allRules.forEach(rule => {
      let triggered = false;
      let ruleMultiplierValue = 1;

      switch(rule.variable) {
        case 'arrival_time':
          const arrival = timeToMinutes(p.arrivalTime);
          const threshold = timeToMinutes(rule.value as string);
          if (rule.operator === '>' && arrival > threshold) {
            triggered = true;
            ruleMultiplierValue = arrival - threshold;
          }
          break;
        case 'ritardo_pesante':
          const arrPesante = timeToMinutes(p.arrivalTime);
          const baseTime = timeToMinutes('20:00'); 
          if (arrPesante > baseTime + 15) triggered = true;
          break;
        case 'forgot_kit':
          if (p.forgotKit && rule.operator === '==') triggered = true;
          break;
        case 'yellow_cards':
          if (p.yellowCards > Number(rule.value)) triggered = true;
          break;
        case 'is_mvp':
          if (p.isMvp && rule.operator === '==') triggered = true;
          break;
        case 'nutmegs':
           if (p.nutmegs > Number(rule.value)) triggered = true;
           break;
      }

      if (triggered) {
        if (rule.action === 'add_fixed') {
          totalFine += rule.actionValue * ruleMultiplierValue;
        } else if (rule.action === 'multiply_quota') {
          multiplier *= rule.actionValue;
        } else if (rule.action === 'half_field_penalty') {
          totalFine += rule.actionValue + (event.totalCost * 0.5);
        }
      }
    });

    return { ...p, totalFine, baseQuota: baseShare, currentMultiplier: multiplier };
  });

  const calculatedParts = updatedParticipants.map(p => {
      const quotaWithMultiplier = baseShare * (p as any).currentMultiplier;
      const multiplierFine = quotaWithMultiplier - baseShare;
      return { ...p, totalFine: p.totalFine + Math.max(0, multiplierFine), baseQuota: baseShare };
  });

  const totalMatchFines = calculatedParts.reduce((acc, p) => acc + p.totalFine, 0);

  if (event.fineAllocation === 'split') {
    const cleanPlayers = calculatedParts.filter(p => p.totalFine === 0);
    const discountPerCleanPlayer = cleanPlayers.length > 0 ? totalMatchFines / cleanPlayers.length : 0;

    return calculatedParts.map(p => {
      const discount = p.totalFine === 0 ? discountPerCleanPlayer : 0;
      let finalAmount = baseShare + p.totalFine - discount;
      return { ...p, finalAmount: Math.max(0, finalAmount) };
    });
  } else {
    return calculatedParts.map(p => ({
      ...p,
      finalAmount: baseShare + p.totalFine
    }));
  }
};

export const getWeightedStats = (friends: string[], events: MatchEvent[], transactions: Transaction[]): UserStats[] => {
  const totalMatches = events.length;
  return friends.map(name => {
    const userEvents = events.filter(e => e.participants.some(p => p.name === name));
    const appearances = userEvents.length;
    
    let totalPaid = 0;
    let totalFines = 0;
    let mvpCount = 0;
    let lvpCount = 0;
    let totalGoals = 0;
    let wins = 0;
    
    userEvents.forEach(e => {
      const p = e.participants.find(part => part.name === name);
      if (p) {
        totalPaid += p.finalAmount;
        totalFines += p.totalFine;
        totalGoals += p.goals || 0;

        // Win Rate logic
        if (e.scoreA !== undefined && e.scoreB !== undefined && p.team) {
            if (p.team === 'A' && e.scoreA > e.scoreB) wins++;
            else if (p.team === 'B' && e.scoreB > e.scoreA) wins++;
        }
      }

      // Votazioni Live
      const mvpVotes = e.votes?.filter(v => v.mvpId === name).length || 0;
      const lvpVotes = e.votes?.filter(v => v.lvpId === name).length || 0;
      if (mvpVotes > lvpVotes && mvpVotes > 0) mvpCount++;
      if (lvpVotes > mvpVotes && lvpVotes > 0) lvpCount++;
    });

    const userT = transactions.filter(t => !t.isPaid && (t.from === name || t.to === name));
    let balance = 0;
    userT.forEach(t => {
      if (t.from === name) balance -= t.amount;
      if (t.to === name) balance += t.amount;
    });

    let title = "Novizio";
    if (mvpCount > 5) title = "Il Fuoriclasse";
    else if (lvpCount > 5) title = "Il Bidone d'Oro";
    else if (totalGoals > 20) title = "Il Bomber";
    else if (totalFines > 100) title = "Il Bancomat";
    else if (appearances > 10 && totalFines === 0) title = "Il Professionista";

    return {
      name,
      nickname: name, // Using name as fallback for stats mapping
      appearances,
      totalPaid,
      totalFines,
      attendanceRate: totalMatches > 0 ? (appearances / totalMatches) * 100 : 0,
      weightedFineAverage: appearances > 0 ? totalFines / appearances : 0,
      reliabilityScore: 100 - (appearances > 0 ? Math.min(100, (totalFines / (appearances * 5)) * 100) : 0),
      netBalance: balance,
      bidoneCount: 0, // This is tracked at user profile level
      mvpCount,
      lvpCount,
      totalGoals,
      winRate: appearances > 0 ? (wins / appearances) * 100 : 0,
      title
    };
  });
};

export const suggestBalancedTeams = (participants: Participant[], allStats: UserStats[]): { teamA: Participant[], teamB: Participant[] } => {
  // Calcolo di un "Skill Score" pesato
  const playerSkills = participants.map(p => {
    const stats = allStats.find(s => s.name === p.name);
    let skill = 50; // Base skill
    if (stats) {
      skill += (stats.mvpCount * 10);
      skill -= (stats.lvpCount * 5);
      skill += (stats.winRate / 2);
      skill += (stats.totalGoals / 5);
      skill += (stats.appearances);
    }
    return { participant: p, skill };
  });

  // Ordinamento per skill decrescente
  playerSkills.sort((a, b) => b.skill - a.skill);

  const teamA: Participant[] = [];
  const teamB: Participant[] = [];

  // Distribuzione a "serpente"
  playerSkills.forEach((ps, index) => {
    if (index % 2 === 0) {
      teamA.push({ ...ps.participant, team: 'A' });
    } else {
      teamB.push({ ...ps.participant, team: 'B' });
    }
  });

  return { teamA, teamB };
};
