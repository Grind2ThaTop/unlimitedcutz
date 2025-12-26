// Rank configuration - LOCKED
// These values define the rank system for the organization

// Account Types
export type AccountType = 'client' | 'barber';

// Matrix Commission Rates (% of $50 membership)
export const CLIENT_MATRIX_PERCENT = 2.5;  // $1.25 per position
export const BARBER_MATRIX_PERCENT = 5.0;  // $2.50 per position

// Matching Bonus Rates
export const CLIENT_MATCHING = { l1: 10, l2: 5 };   // 10% L1, 5% L2
export const BARBER_MATCHING = { l1: 20, l2: 10 };  // 20% L1, 10% L2

// Get matrix percentage based on account type
export const getMatrixPercent = (accountType: AccountType): number => {
  return accountType === 'barber' ? BARBER_MATRIX_PERCENT : CLIENT_MATRIX_PERCENT;
};

// Get matching percentages based on account type
export const getMatchingRates = (accountType: AccountType): { l1: number; l2: number } => {
  return accountType === 'barber' ? BARBER_MATCHING : CLIENT_MATCHING;
};

export type RankId = 'rookie' | 'hustla' | 'grinder' | 'influencer' | 'executive' | 'partner';

export interface RankRequirements {
  personallyEnrolled: number;
  teamActivity?: boolean;
  orgVolume?: boolean;
  leadershipVolume?: boolean;
  orgStability?: boolean;
  elitePerformance?: boolean;
  adminApproval?: boolean;
}

export interface RankBenefits {
  fastStart: boolean;
  matching: {
    level1?: number;
    level2?: number;
  } | 'full' | null;
  influencerBonuses?: boolean;
  pools: ('diamond' | 'crown')[];
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
}

export const RANKS: Record<RankId, RankConfig> = {
  rookie: {
    id: 'rookie',
    name: 'Rookie',
    emoji: '🔹',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    matrixLevels: 3,
    requirements: { personallyEnrolled: 0 },
    benefits: { fastStart: true, matching: null, pools: [] },
    description: 'Entry Level - You just locked in your position.',
  },
  hustla: {
    id: 'hustla',
    name: 'Hustla',
    emoji: '🟤',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    borderColor: 'border-amber-600/20',
    matrixLevels: 4,
    requirements: { personallyEnrolled: 3 },
    benefits: { fastStart: true, matching: null, pools: [] },
    description: 'You move. You bring people.',
  },
  grinder: {
    id: 'grinder',
    name: 'Grinder',
    emoji: '⚫',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    borderColor: 'border-slate-400/20',
    matrixLevels: 5,
    requirements: { personallyEnrolled: 5, teamActivity: true },
    benefits: { fastStart: true, matching: { level1: 10 }, pools: [] },
    description: 'Consistent builder. Team starter.',
  },
  influencer: {
    id: 'influencer',
    name: 'Influencer',
    emoji: '🔴',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    matrixLevels: 6,
    requirements: { personallyEnrolled: 10, orgVolume: true },
    benefits: { fastStart: true, matching: { level1: 10, level2: 5 }, influencerBonuses: true, pools: [] },
    description: 'You move volume and people follow.',
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    emoji: '💼',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600/10',
    borderColor: 'border-slate-600/20',
    matrixLevels: 7,
    requirements: { personallyEnrolled: 10, leadershipVolume: true, orgStability: true },
    benefits: { fastStart: true, matching: 'full', pools: ['diamond'] },
    description: 'You built a real organization.',
  },
  partner: {
    id: 'partner',
    name: 'Partner',
    emoji: '💎',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    matrixLevels: 8,
    requirements: { personallyEnrolled: 10, elitePerformance: true, adminApproval: true },
    benefits: { fastStart: true, matching: 'full', pools: ['diamond', 'crown'] },
    description: 'Ownership mindset. Long-term builder.',
  },
};

export const RANK_ORDER: RankId[] = ['rookie', 'hustla', 'grinder', 'influencer', 'executive', 'partner'];

export const getRankByIndex = (index: number): RankConfig => {
  return RANKS[RANK_ORDER[index]] || RANKS.rookie;
};

export const getNextRank = (currentRank: RankId): RankConfig | null => {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex === -1 || currentIndex >= RANK_ORDER.length - 1) return null;
  return RANKS[RANK_ORDER[currentIndex + 1]];
};

export const getMatchingBonusDisplay = (rank: RankConfig): string => {
  if (!rank.benefits.matching) return 'No';
  if (rank.benefits.matching === 'full') return 'Full';
  const parts: string[] = [];
  if (rank.benefits.matching.level1) parts.push(`L1: ${rank.benefits.matching.level1}%`);
  if (rank.benefits.matching.level2) parts.push(`L2: ${rank.benefits.matching.level2}%`);
  return parts.join(', ') || 'No';
};

export const getPoolsDisplay = (rank: RankConfig): string => {
  if (rank.benefits.pools.length === 0) return 'No';
  return rank.benefits.pools.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ');
};
