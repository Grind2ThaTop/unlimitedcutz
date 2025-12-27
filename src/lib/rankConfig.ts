// Rank configuration - NEW COMP PLAN
// These values define the rank system with commission depth unlocking

// Account Types
export type AccountType = 'client' | 'barber';

// Matrix Commission Rates (% of $50 membership)
export const CLIENT_MATRIX_PERCENT = 2.5;  // $1.25 per position
export const BARBER_MATRIX_PERCENT = 5.0;  // $2.50 per position

// Platinum+ Barber Override for Levels 5-8
export const PLATINUM_BARBER_L5_OVERRIDE = 8.0;  // 8% for L5-L8

// Matching Bonus Rates
export const CLIENT_MATCHING = { l1: 10, l2: 5 };   // 10% L1, 5% L2
export const BARBER_MATCHING = { l1: 20, l2: 10, l3: 10 };  // 20% L1, 10% L2, 10% L3

// Fast Start Rates
export const CLIENT_FAST_START = { level_1: 20, level_2: 10, level_3: 5 };
export const BARBER_FAST_START = { level_1: 25, level_2: 15, level_3: 10 };

// Get matrix percentage based on account type
export const getMatrixPercent = (accountType: AccountType): number => {
  return accountType === 'barber' ? BARBER_MATRIX_PERCENT : CLIENT_MATRIX_PERCENT;
};

// Get matching percentages based on account type
export const getMatchingRates = (accountType: AccountType): { l1: number; l2: number; l3?: number } => {
  return accountType === 'barber' ? BARBER_MATCHING : CLIENT_MATCHING;
};

// Get fast start rates based on account type
export const getFastStartRates = (accountType: AccountType): { level_1: number; level_2: number; level_3: number } => {
  return accountType === 'barber' ? BARBER_FAST_START : CLIENT_FAST_START;
};

// New rank IDs matching database enum
export type RankId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface RankRequirements {
  // New qualification logic based on downline ranks
  activeBronze?: number;    // Number of active BRONZE members in downline
  activeSilver?: number;    // Number of active SILVER members in downline
  activeGold?: number;      // Number of active GOLD members in downline
  activePlatinum?: number;  // Number of active PLATINUM members in downline
  adminApproval?: boolean;
}

export interface RankBenefits {
  fastStart: boolean;
  matchingDepth: number;  // How many levels of matching bonus (0 = none)
  pools: ('diamond' | 'crown')[];
  barberL5Override?: boolean; // Platinum+ barbers get 8% for L5-L8
}

export interface RankConfig {
  id: RankId;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  matrixLevels: number;
  requirements: RankRequirements;
  benefits: RankBenefits;
  description: string;
  qualificationText: string;
}

export const RANKS: Record<RankId, RankConfig> = {
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    emoji: '🟤',
    color: 'text-amber-700',
    bgColor: 'bg-amber-700/10',
    borderColor: 'border-amber-700/20',
    matrixLevels: 3,
    requirements: {},  // Just active $50/month membership
    benefits: { fastStart: true, matchingDepth: 0, pools: [] },
    description: 'Entry Level - Active $50/month membership',
    qualificationText: 'Active $50/month membership',
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    emoji: '⚪',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/20',
    matrixLevels: 4,
    requirements: { activeBronze: 2 },
    benefits: { fastStart: true, matchingDepth: 0, pools: [] },
    description: 'First builder unlock',
    qualificationText: '2 active BRONZE members in downline',
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    emoji: '🟡',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    matrixLevels: 5,
    requirements: { activeSilver: 2 },
    benefits: { fastStart: true, matchingDepth: 2, pools: [] },
    description: 'Leadership entry level',
    qualificationText: '2 active SILVER members in downline',
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    emoji: '🔵',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    matrixLevels: 8,  // Platinum unlocks levels 6-8
    requirements: { activeGold: 3 },
    benefits: { fastStart: true, matchingDepth: 3, pools: ['diamond'], barberL5Override: true },
    description: 'Builder + Leader',
    qualificationText: '3 active GOLD members in downline',
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    matrixLevels: 8,
    requirements: { activePlatinum: 4 },
    benefits: { fastStart: true, matchingDepth: 4, pools: ['diamond', 'crown'], barberL5Override: true },
    description: 'Top-tier leadership',
    qualificationText: '4 active PLATINUM members in downline',
  },
};

export const RANK_ORDER: RankId[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// Map rank to maximum payable matrix level
export const RANK_TO_MAX_LEVEL: Record<RankId, number> = {
  bronze: 3,
  silver: 4,
  gold: 5,
  platinum: 8,  // Platinum unlocks L6-L8
  diamond: 8,
};

// Map rank to matching bonus depth
export const RANK_TO_MATCHING_DEPTH: Record<RankId, number> = {
  bronze: 0,
  silver: 0,
  gold: 2,
  platinum: 3,
  diamond: 4,
};

export const getRankByIndex = (index: number): RankConfig => {
  return RANKS[RANK_ORDER[index]] || RANKS.bronze;
};

export const getNextRank = (currentRank: RankId): RankConfig | null => {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex === -1 || currentIndex >= RANK_ORDER.length - 1) return null;
  return RANKS[RANK_ORDER[currentIndex + 1]];
};

export const getMatchingBonusDisplay = (rank: RankConfig): string => {
  if (rank.benefits.matchingDepth === 0) return 'No';
  return `${rank.benefits.matchingDepth} levels`;
};

export const getPoolsDisplay = (rank: RankConfig): string => {
  if (rank.benefits.pools.length === 0) return 'No';
  return rank.benefits.pools.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ');
};
