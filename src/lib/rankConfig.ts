// Rank configuration - NEW COMP PLAN
// These values define the rank system with commission depth unlocking

// Account Types
export type AccountType = 'client' | 'barber';

// Matrix Commission Rates (% of $50 membership)
export const CLIENT_MATRIX_PERCENT = 2.5;  // $1.25 per position
export const BARBER_MATRIX_PERCENT = 5.0;  // $2.50 per position (Bronze-Gold)
export const PLATINUM_BARBER_RATE = 7.0;   // 7% for Platinum+ barbers

// Platinum+ Barber Override for Levels 5-8
export const PLATINUM_BARBER_L5_OVERRIDE = 8.0;  // 8% for L5-L8

// Matching Bonus Rates
export const CLIENT_MATCHING = { l1: 10, l2: 5 };   // 10% L1, 5% L2
export const BARBER_MATCHING = { l1: 20, l2: 10, l3: 10 };  // 20% L1, 10% L2, 10% L3

// Fast Start Rates
export const CLIENT_FAST_START = { level_1: 20, level_2: 10, level_3: 5 };
export const BARBER_FAST_START = { level_1: 25, level_2: 15, level_3: 10 };

// BARBER Level Unlocks (different from client/general)
export const BARBER_LEVEL_UNLOCKS: Record<RankId, number> = {
  bronze: 4,
  silver: 5,
  gold: 6,
  platinum: 6,
  diamond: 6,
};

// CLIENT Level Unlocks
export const CLIENT_LEVEL_UNLOCKS: Record<RankId, number> = {
  bronze: 3,
  silver: 4,
  gold: 5,
  platinum: 8,
  diamond: 8,
};

// Get matrix percentage based on account type and rank
export const getMatrixPercent = (accountType: AccountType, rankId?: RankId): number => {
  if (accountType === 'barber') {
    // Platinum+ barbers get 7%
    if (rankId === 'platinum' || rankId === 'diamond') {
      return PLATINUM_BARBER_RATE;
    }
    return BARBER_MATRIX_PERCENT;
  }
  return CLIENT_MATRIX_PERCENT;
};

// Get max level based on account type and rank
export const getMaxLevelForRank = (accountType: AccountType, rankId: RankId): number => {
  if (accountType === 'barber') {
    return BARBER_LEVEL_UNLOCKS[rankId];
  }
  return CLIENT_LEVEL_UNLOCKS[rankId];
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

// PAM-based rank requirements
export interface RankRequirements {
  // PAM (Personal Active Matrix) based requirements
  personalActiveDirects?: number;  // Number of personal active directs needed
  pamHasRank?: RankId;             // Must have this rank somewhere in PAM downline
  adminApproval?: boolean;
  
  // Legacy fields for display purposes
  activeBronze?: number;
  activeSilver?: number;
  activeGold?: number;
  activePlatinum?: number;
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
  matrixLevels: number;  // For display (client default)
  barberMatrixLevels: number;  // For barber display
  requirements: RankRequirements;
  benefits: RankBenefits;
  description: string;
  qualificationText: string;
  barberQualificationText: string;  // PAM-based text for barbers
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
    barberMatrixLevels: 4,
    requirements: {},  // Just active $50/month membership
    benefits: { fastStart: true, matchingDepth: 0, pools: [] },
    description: 'Entry Level - Active $50/month membership',
    qualificationText: 'Active $50/month membership',
    barberQualificationText: 'Active $150/month membership',
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    emoji: '⚪',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/20',
    matrixLevels: 4,
    barberMatrixLevels: 5,
    requirements: { personalActiveDirects: 2, pamHasRank: 'silver', activeBronze: 2 },
    benefits: { fastStart: true, matchingDepth: 0, pools: [] },
    description: 'First builder unlock',
    qualificationText: '2 active BRONZE members in downline',
    barberQualificationText: '2 personal active directs + 1 SILVER in your team',
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    emoji: '🟡',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    matrixLevels: 5,
    barberMatrixLevels: 6,
    requirements: { personalActiveDirects: 2, pamHasRank: 'gold', activeSilver: 2 },
    benefits: { fastStart: true, matchingDepth: 2, pools: [] },
    description: 'Leadership entry level',
    qualificationText: '2 active SILVER members in downline',
    barberQualificationText: '2 personal active directs + 1 GOLD in your team',
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    emoji: '🔵',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    matrixLevels: 8,
    barberMatrixLevels: 6,  // Barbers cap at 6
    requirements: { personalActiveDirects: 2, pamHasRank: 'platinum', activeGold: 3 },
    benefits: { fastStart: true, matchingDepth: 3, pools: ['diamond'], barberL5Override: true },
    description: 'Builder + Leader',
    qualificationText: '3 active GOLD members in downline',
    barberQualificationText: '2 personal active directs + 1 PLATINUM in your team',
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    matrixLevels: 8,
    barberMatrixLevels: 6,  // Barbers cap at 6
    requirements: { personalActiveDirects: 2, pamHasRank: 'diamond', activePlatinum: 4 },
    benefits: { fastStart: true, matchingDepth: 4, pools: ['diamond', 'crown'], barberL5Override: true },
    description: 'Top-tier leadership',
    qualificationText: '4 active PLATINUM members in downline',
    barberQualificationText: '2 personal active directs + 1 DIAMOND in your team',
  },
};

export const RANK_ORDER: RankId[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// Map rank to maximum payable matrix level (CLIENT defaults)
export const RANK_TO_MAX_LEVEL: Record<RankId, number> = {
  bronze: 3,
  silver: 4,
  gold: 5,
  platinum: 8,
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
