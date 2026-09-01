export type BracketType = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';

export type TournamentArchetype = 'elimination' | 'points';

export function getTournamentArchetype(format: BracketType): TournamentArchetype {
  return format === 'round_robin' || format === 'swiss' ? 'points' : 'elimination';
}

export function getFormatDisplayLabel(format: BracketType): {
  archetypeLabel: string;
  subLabel: string;
  badgeColor: string;
  emoji: string;
} {
  switch (format) {
    case 'single_elimination':
      return {
        archetypeLabel: 'Đấu Vòng Loại',
        subLabel: 'Loại Trực Tiếp (Single Elim)',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        emoji: '⚔️',
      };
    case 'double_elimination':
      return {
        archetypeLabel: 'Đấu Vòng Loại',
        subLabel: 'Nhánh Thắng/Thua (Double Elim)',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        emoji: '🛡️',
      };
    case 'round_robin':
    default:
      return {
        archetypeLabel: 'Dạng Tính Điểm',
        subLabel: 'Vòng Tròn Bảng Điểm & BXH',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        emoji: '📊',
      };
  }
}

export type GameCategory = 'lol_aram' | 'lol_1v1' | 'lol_5v5' | 'valorant_5v5' | 'cs2' | 'tft' | 'fc24' | 'mobile_legends' | 'custom';

export type MatchStatus = 'pending' | 'ready' | 'live' | 'finished' | 'walkover';

export type DraftMode = 'tournament_draft' | 'fearless_draft' | 'quick_3_ban' | 'blind_pick' | 'solo_1v1_ban' | 'none';

export type SideSelectionRule = 'coin_toss' | 'higher_seed' | 'loser_picks_next';

export type TieBreakRule = 'head_to_head' | 'round_diff' | 'rounds_won' | 'buchholz';

export interface ScheduleConfig {
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  matchDurationMinutes: number; // Duration per match/BO
  bufferTimeMinutes: number; // Break between matches
  concurrentStreams: number; // Number of simultaneous matches/voice channels
  voiceRoomPrefix: string; // e.g. "🔊 Voice Phòng"
}

export interface Participant {
  id: string;
  name: string;
  discordTag?: string; // e.g. @player#1234 or @discord_id
  seed: number;
  avatar?: string;
  color?: string;
  members?: string[]; // For 5v5 team members
  captain?: string;
  stats?: {
    matchesPlayed: number;
    wins: number;
    draws?: number;
    losses: number;
    roundsWon: number;
    roundsLost: number;
    points: number; // for round robin / swiss
    buchholz?: number; // for swiss
  };
}

export interface GameScore {
  p1Score: number;
  p2Score: number;
  map?: string;
  winnerId?: string;
  duration?: string;
  mvp?: string;
}

export interface Match {
  id: string;
  roundIndex: number; // 0-based
  matchIndex: number; // position in round
  bracketSection: 'winners' | 'losers' | 'grand_final' | 'third_place' | 'group_stage';
  
  participant1Id?: string;
  participant2Id?: string;
  
  // Custom score summary (e.g. 2 - 1)
  score1: number;
  score2: number;
  
  bestOf: number; // 1, 2, 3, 5, 7
  games?: GameScore[];
  
  winnerId?: string;
  loserId?: string;
  status: MatchStatus;
  
  // References to subsequent matches
  nextMatchId?: string;
  nextMatchSlot?: 1 | 2;
  loserNextMatchId?: string; // For Double Elimination
  loserNextMatchSlot?: 1 | 2;
  
  // Scheduling & Discord Integration
  scheduledTime?: string;
  scheduledTimestamp?: number; // Unix timestamp in seconds for Discord <t:TIMESTAMP:F>
  voiceChannel?: string; // e.g. "🔊 Voice Phòng 1"
  streamUrl?: string;
  notes?: string;
  mapPicked?: string;
  mvp?: string;
}

export interface Round {
  id: string;
  name: string;
  bracketSection: 'winners' | 'losers' | 'grand_final' | 'third_place' | 'group_stage';
  roundIndex: number;
  bestOf: number;
  matches: Match[];
}

export interface TournamentPrizes {
  // 1. Tiền mặt
  cash: {
    enabled: boolean;
    totalAmount?: string;
    champion?: string;
    runnerUp?: string;
    thirdPlace?: string;
    mvp?: string;
    paymentMethod?: string;
  };
  // 2. Tiền In-Game
  inGame: {
    enabled: boolean;
    currencyName?: string;
    totalAmount?: string;
    champion?: string;
    runnerUp?: string;
    thirdPlace?: string;
    mvp?: string;
  };
  // 3. ROLE SERVER
  roles: {
    enabled: boolean;
    championRole?: string;
    runnerUpRole?: string;
    thirdPlaceRole?: string;
    participantRole?: string;
    mvpRole?: string;
    rolePerks?: string;
  };
  // 4. Các phần thưởng khác
  other: {
    enabled: boolean;
    items: string[];
    sponsorName?: string;
    customNotes?: string;
  };
}

export interface TournamentRules {
  // Ban / Pick Draft Settings
  draftMode: DraftMode;
  bansPerTeam: number; // 0, 1, 2, 3, 5
  sideSelection: SideSelectionRule;
  
  // Points System (For Round Robin & Groups)
  winPoints: number; // default: 3
  drawPoints: number; // default: 1
  lossPoints: number; // default: 0
  bonusPointPerRoundWin: boolean; // Add +1 point for each round/map won
  tieBreakRule: TieBreakRule;
  
  // Win condition & In-Game Rules
  winCondition1v1?: 'standard' | 'first_blood_tower_100cs' | 'first_to_2_kills';
  maxPauseMinutes?: number; // e.g. 10 mins
  allowSubstitutes?: boolean;
}

export interface TournamentDivision {
  id: string;
  name: string; // e.g. "Bảng Toái Mộng", "Bảng Thiết Y", "Bảng Huyết Hà", "Bảng Cửu Linh", "Bảng Tố Vấn", "Bảng Long Ngâm" hoặc "Bảng A"
  sectKey?: string; // Optional icon or sect association (toai_mong, thiet_y, huyet_ha, cuu_linh, to_van, long_ngam, custom)
  sectIcon?: string; // e.g. "🗡️", "🛡️", "🚩", "🔮", "🪷", "⚡"
  format: BracketType;
  participants: Participant[];
  rounds: Round[];
  championId?: string;
  runnerUpId?: string;
  thirdPlaceId?: string;
  status: 'draft' | 'ongoing' | 'completed';
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: GameCategory;
  customGameName?: string;
  format: BracketType;
  bannerImage?: string;
  
  createdAt: number;
  updatedAt: number;
  
  participants: Participant[];
  rounds: Round[];

  // Multiple Divisions / Bảng Đấu Lưu Phái (VD: Bảng Toái Mộng, Bảng Thiết Y...)
  divisions?: TournamentDivision[];
  activeDivisionId?: string;
  
  // Configuration
  settings: {
    hasThirdPlaceMatch: boolean;
    grandFinalReset: boolean; // For Double Elim if loser bracket champion beats winner bracket champion in game 1
    defaultBestOf: number;
    quartersBestOf?: number;
    semisBestOf: number;
    finalsBestOf: number;
    discordServerName?: string;
    discordChannel?: string;
    prizePool?: string;
    prizes?: TournamentPrizes;
    rulesText?: string;
    rulesConfig?: TournamentRules;
    scheduleConfig?: ScheduleConfig;
  };
  
  status: 'draft' | 'ongoing' | 'completed';
  championId?: string;
  runnerUpId?: string;
  thirdPlaceId?: string;
}

export interface GamePresetInfo {
  id: GameCategory;
  name: string;
  badge: string;
  iconName: string;
  color: string;
  defaultFormat: BracketType;
  defaultBestOf: number;
  maps: string[];
  teamSize: '1v1' | '5v5' | '8-player' | 'custom';
  description: string;
}

