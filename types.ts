
export type VariableType = 'arrival_time' | 'goal_count' | 'is_mvp' | 'yellow_cards' | 'forgot_kit' | 'own_goals' | 'nutmegs' | 'post_hits' | 'custom' | 'ritardo_pesante';
export type Operator = '>' | '<' | '==' | '>=' | '!=';
export type ActionType = 'add_fixed' | 'multiply_quota' | 'percent_total' | 'contribute_to_fund' | 'half_field_penalty';
export type StakeCategory = 'money' | 'drink' | 'food' | 'humiliation' | 'other' | 'fund';
export type PlayerRole = 'Portiere' | 'Difensore' | 'Centrocampista' | 'Attaccante' | 'Universale';
export type MatchType = 5 | 6 | 7 | 8 | 11;

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // Nicknames o IDs
  pendingInvites: string[]; // Nicknames degli utenti invitati
  description: string;
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromNickname: string;
  toUserId: string;
  toNickname: string; 
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  password?: string;
  idCode: string;
  avatar?: string;
  preferredRoles: PlayerRole[];
  bio: string;
  bidoneCount: number;
  mvpCount: number;
  lvpCount: number;
  achievements: string[];
  friends: string[]; 
  friendRequests: FriendRequest[]; // Ricevute
  sentRequests: FriendRequest[];   // Inviate
}

export interface Vote {
  voterId: string;
  mvpId: string; 
  lvpId: string; 
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'group_invite' | 'friend_request' | 'friend_request_sent';
  targetId?: string; 
  date: string;
  read: boolean;
}

export interface RegisteredPlayer {
  userId: string;
  name: string;
  nickname: string;
  timestamp: number;
  guests: number;
}

export interface Rule {
  id: string;
  variable: VariableType;
  operator: Operator;
  value: string | number;
  action: ActionType;
  actionValue: number;
  description: string;
  ownerId?: string;
  message?: string;
}

export interface Infraction {
  ruleId: string;
  quantity: number;
  calculatedAmount: number;
}

export interface Participant {
  id: string;
  userId?: string;
  name: string;
  arrivalTime: string;
  goals: number;
  nutmegs: number;
  postHits: number;
  yellowCards: number;
  ownGoals: number;
  forgotKit: boolean;
  isMvp: boolean;
  baseQuota: number;
  totalFine: number;
  finalAmount: number;
  infractions: Infraction[];
  team?: 'A' | 'B';
}

export interface MatchEvent {
  id: string;
  ownerId: string;
  groupId: string;
  matchName: string;
  templateId?: string;
  date: string; 
  time: string; 
  location: string;
  totalCost: number;
  maxParticipants: number;
  matchType: MatchType;
  participants: Participant[];
  registrations: RegisteredPlayer[];
  votes: Vote[];
  confirmedResult: string[]; 
  status: 'open' | 'closed' | 'registration' | 'voting';
  organizer: string;
  eventRules: Rule[];
  disabledGlobalRuleIds: string[];
  fineAllocation: 'split' | 'fund';
  scoreA?: number;
  scoreB?: number;
  isRecurring: boolean;
  recurringDays?: number[];
}

export interface RecurringTemplate {
  id: string;
  ownerId: string;
  name: string;
  defaultLocation: string;
  defaultCost: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'custom';
  description: string;
}

export interface Bet {
  id: string;
  ownerId: string;
  description: string;
  proposer: string;
  participants: string[]; 
  stake: string;
  stakeCategory: StakeCategory;
  monetaryValue?: number;
  spiciness: 1 | 2 | 3 | 4 | 5; 
  status: 'open' | 'won' | 'lost' | 'cancelled';
  winner?: string; 
}

export interface Transaction {
  id: string;
  ownerId: string;
  from: string;
  to: string; 
  amount: number;
  reason: string;
  date: string;
  isPaid: boolean;
}

export type ViewType = 'landing' | 'auth_login' | 'auth_signup' | 'dashboard' | 'events' | 'templates' | 'ledger' | 'fund' | 'bets' | 'friends' | 'rules' | 'info' | 'profile' | 'notifications';

export interface UserStats {
  name: string;
  nickname: string;
  appearances: number;
  totalPaid: number;
  totalFines: number;
  attendanceRate: number;
  weightedFineAverage: number;
  reliabilityScore: number;
  netBalance: number;
  bidoneCount: number;
  mvpCount: number;
  lvpCount: number;
  totalGoals: number;
  winRate: number;
  title: string;
}
