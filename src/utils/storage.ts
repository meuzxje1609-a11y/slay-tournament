import { Tournament } from '../types/tournament';
import {
  SAMPLE_PARTICIPANTS_5V5_VALORANT,
  SAMPLE_PARTICIPANTS_16_TEAMS,
  SAMPLE_PARTICIPANTS_5V5_ARAM,
  SAMPLE_PARTICIPANTS_1V1,
} from '../data/presets';
import {
  generateSingleElimination,
  generateDoubleElimination,
  generateRoundRobin,
  getRoundName,
} from './bracketGenerator';

const STORAGE_KEY = 'esports_tournament_bracket_data';
const ACTIVE_TOURNAMENT_ID_KEY = 'esports_active_tournament_id';
const ADMIN_AUTH_KEY = 'esports_admin_auth_state';

export function createInitialTournaments(): Tournament[] {
  // 1. Giải 16 Đội có Đầy Đủ: Vòng Loại (Vòng 1/8) -> Tứ Kết -> Bán Kết -> Chung Kết
  const major16Participants = SAMPLE_PARTICIPANTS_16_TEAMS;
  const major16Settings = {
    hasThirdPlaceMatch: true,
    grandFinalReset: false,
    defaultBestOf: 1,
    quartersBestOf: 3,
    semisBestOf: 3,
    finalsBestOf: 5,
    discordServerName: 'Discord Gaming VN Community',
    discordChannel: '#vong-loai-16-doi',
    prizePool: '5.000.000 VNĐ + Huy Chương Vàng 🥇',
    rulesText: '1. Thi đấu theo sơ đồ 16 đội loại trực tiếp (Vòng Loại 1/8 -> Tứ Kết -> Bán Kết -> Chung Kết).\n2. Vòng loại BO1, Tứ kết & Bán kết BO3, Chung kết BO5.\n3. Điểm danh trước giờ thi đấu 15 phút tại Voice Discord.',
  };
  const major16Rounds = generateSingleElimination(major16Participants, major16Settings);

  const major16Tournament: Tournament = {
    id: 'tournament-major-16',
    name: 'SLAY TOURNAMENT',
    description: 'Tournament Slay Server',
    game: 'custom',
    customGameName: 'S L A Y',
    format: 'single_elimination',
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now(),
    participants: major16Participants,
    rounds: major16Rounds,
    settings: major16Settings,
    status: 'ongoing',
  };

  // 2. Multi-Esports 5v5 (16 Đội)
  const valParticipants = SAMPLE_PARTICIPANTS_5V5_VALORANT;
  const valSettings: Tournament['settings'] = {
    hasThirdPlaceMatch: true,
    grandFinalReset: false,
    defaultBestOf: 1,
    semisBestOf: 3,
    finalsBestOf: 5,
    discordServerName: 'Tournament Discord Server Slay',
    discordChannel: '#esports-cup',
    prizePool: '1.000.000 VNĐ + 11.500 VP + Role 👑',
    prizes: {
      cash: {
        enabled: true,
        totalAmount: '1.000.000 VNĐ',
        champion: '600.000 VNĐ',
        runnerUp: '300.000 VNĐ',
        thirdPlace: '100.000 VNĐ',
        mvp: '50.000 VNĐ',
        paymentMethod: 'Chuyển khoản Banking / MoMo',
      },
      inGame: {
        enabled: true,
        currencyName: 'VP (Valorant Points) / Riot Points',
        totalAmount: '11.500 VP',
        champion: '5.500 VP',
        runnerUp: '3.500 VP',
        thirdPlace: '2.500 VP',
      },
      roles: {
        enabled: true,
        championRole: '@Champion Slay 👑',
        runnerUpRole: '@Á Quân Slay 🥈',
        thirdPlaceRole: '@Hạng Ba Slay 🥉',
        participantRole: '@Tournament Fighter ⚔️',
        mvpRole: '@Finals MVP 🌟',
        rolePerks: 'Đổi màu tên nổi bật, kênh voice VIP và biểu tượng độc quyền',
      },
      other: {
        enabled: true,
        items: ['Nitro Discord 1 Tháng', 'Thẻ quà tặng / Custom Emote'],
        sponsorName: 'Slay Discord Community',
        customNotes: 'Phần thưởng trao trong vòng 24h sau khi trận Chung Kết kết thúc.',
      },
    },
    rulesText: '1. Thi đấu theo quy chuẩn thể thức 4 vòng (Vòng loại -> Tứ kết -> Bán kết -> Chung kết).\n2. Điểm danh trước trận 15 phút tại Voice Discord.\n3. Quyết định của Trọng tài là quyết định cuối cùng.',
  };
  const valRounds = generateSingleElimination(valParticipants, valSettings);

  const valTournament: Tournament = {
    id: 'tournament-val-1',
    name: 'SLAY TOURNAMENT',
    description: 'Tournament Discord Server Slay',
    game: 'custom',
    customGameName: 'S L A Y',
    format: 'single_elimination',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now(),
    participants: valParticipants,
    rounds: valRounds,
    settings: valSettings,
    status: 'ongoing',
  };

  // 3. LoL ARAM 5v5
  const aramParticipants = SAMPLE_PARTICIPANTS_5V5_ARAM;
  const aramSettings = {
    hasThirdPlaceMatch: false,
    grandFinalReset: false,
    defaultBestOf: 1,
    semisBestOf: 3,
    finalsBestOf: 3,
    discordServerName: 'Discord Gaming VN Community',
    discordChannel: '#aram-night',
    prizePool: '500.000 VNĐ + 50.000 Discord Coins',
    rulesText: '1. Bản đồ Howling Abyss, cấm đồ phụ trợ và cấm cố tình backdoor tự sát không đánh lính.\n2. Chung kết đánh BO3.',
  };
  const aramRounds = generateSingleElimination(aramParticipants, aramSettings);

  const aramTournament: Tournament = {
    id: 'tournament-aram-2',
    name: 'Đại Chiến ARAM 5v5 Discord Night Showdown',
    description: 'Hỗn chiến Vực Gió Hú tối thứ 7 cực căng thẳng và giải trí',
    game: 'lol_aram',
    format: 'single_elimination',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    participants: aramParticipants,
    rounds: aramRounds,
    settings: aramSettings,
    status: 'ongoing',
  };

  // 4. Solo 1v1 King (Đấu Vòng Loại Double Elimination)
  const soloParticipants = SAMPLE_PARTICIPANTS_1V1;
  const soloSettings = {
    hasThirdPlaceMatch: true,
    grandFinalReset: true,
    defaultBestOf: 3,
    semisBestOf: 3,
    finalsBestOf: 5,
    discordServerName: 'Discord Gaming VN Community',
    discordChannel: '#solo-1v1-king',
    prizePool: '300.000 VNĐ + Danh Hiệu 1v1 King ⚔️',
    rulesText: '1. Map Howling Abyss / Summoner Rift Mid.\n2. Điều kiện thắng: 1 Mạng đầu (First Blood) HOẶC 100 Lính HOẶC Trụ đầu.',
  };
  const soloRounds = generateDoubleElimination(soloParticipants, soloSettings);

  const soloTournament: Tournament = {
    id: 'tournament-solo-3',
    name: 'King of Mid - Giải Đấu Solo 1v1 Thách Đấu',
    description: 'Đấu trường thể hiện kỹ năng cá nhân 1v1 đỉnh cao Nhánh Thắng Nhánh Thua',
    game: 'lol_1v1',
    format: 'double_elimination',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now(),
    participants: soloParticipants,
    rounds: soloRounds,
    settings: soloSettings,
    status: 'ongoing',
  };

  // 5. Giải Vòng Bảng Tính Điểm (Dạng Tính Điểm Round Robin)
  const roundRobinParticipants = [
    { id: 'rr-1', name: 'T1 Esports', seed: 1, discordTag: '@t1_captain', members: ['Faker', 'Zeus', 'Oner', 'Gumayusi', 'Keria'] },
    { id: 'rr-2', name: 'Gen.G Gaming', seed: 2, discordTag: '@geng_cap', members: ['Chovy', 'Kiin', 'Canyon', 'Peyz', 'Lehends'] },
    { id: 'rr-3', name: 'Bilibili Gaming', seed: 3, discordTag: '@blg_captain', members: ['Bin', 'Xun', 'Knight', 'Elk', 'ON'] },
    { id: 'rr-4', name: 'Weibo Gaming', seed: 4, discordTag: '@wbg_captain', members: ['Breathe', 'Tarzan', 'Xiaohu', 'Light', 'Crisp'] },
  ];
  const roundRobinSettings = {
    hasThirdPlaceMatch: false,
    grandFinalReset: false,
    defaultBestOf: 3,
    semisBestOf: 3,
    finalsBestOf: 5,
    customRules: {
      banCount: 5,
      draftMode: 'tournament_draft' as const,
      sideSelectionRule: 'coin_toss' as const,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      tieBreakRule: 'head_to_head' as const,
    },
    discordServerName: 'Discord Gaming VN Community',
    discordChannel: '#vong-bang-tinh-diem',
    prizePool: '2.000.000 VNĐ + Cúp Vô Địch 🏆',
    rulesText: '1. Vòng tròn tính điểm: Thắng +3 điểm, Thua +0 điểm.\n2. Ưu tiên xét Đối đầu trực tiếp -> Hiệu số ván thắng/thua.\n3. Mỗi trận đánh BO3.',
  };
  const roundRobinRounds = generateRoundRobin(roundRobinParticipants, roundRobinSettings);

  const pointsTournament: Tournament = {
    id: 'tournament-points-4',
    name: 'Giải Vô Địch Vòng Tròn Tính Điểm - Discord League',
    description: 'Thi đấu vòng tròn tính điểm theo Bảng Xếp Hạng trực tiếp (W/L, Hiệu số, Điểm)',
    game: 'lol_5v5',
    format: 'round_robin',
    createdAt: Date.now() - 900000,
    updatedAt: Date.now(),
    participants: roundRobinParticipants,
    rounds: roundRobinRounds,
    settings: roundRobinSettings,
    status: 'ongoing',
  };

  return [major16Tournament, valTournament, pointsTournament, aramTournament, soloTournament];
}

export function getActiveTournamentId(): string {
  return localStorage.getItem(ACTIVE_TOURNAMENT_ID_KEY) || 'tournament-major-16';
}

export function setActiveTournamentId(id: string): void {
  localStorage.setItem(ACTIVE_TOURNAMENT_ID_KEY, id);
}

export function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialTournaments();
      saveTournaments(initial);
      return initial;
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      const initial = createInitialTournaments();
      saveTournaments(initial);
      return initial;
    }

    // If existing list lacks the 16-team major tournament or has outdated 3-round brackets, refresh initial
    const hasMajor16 = list.some((t: Tournament) => t.id === 'tournament-major-16');
    let workingList = list;
    if (!hasMajor16) {
      const initial = createInitialTournaments();
      workingList = [initial[0], ...list];
    }

    // Refresh round labels & ensure Single Elimination brackets have 4 full stages & correct titles
    const normalized = workingList.map((t: Tournament) => {
      let tournamentName = t.name;
      let tournamentDesc = t.description;
      let gameCat = t.game;
      let customGameName = t.customGameName;

      if (t.id === 'tournament-val-1' || t.name.includes('Giải Valorant 5v5') || t.name === 'SLAY TOURNAMENT') {
        tournamentName = 'SLAY TOURNAMENT';
        tournamentDesc = 'Tournament Discord Server Slay';
        gameCat = 'custom';
        customGameName = 'S L A Y';
      } else if (t.id === 'tournament-major-16' || t.name.includes('Giải Vô Địch Siêu Cúp') || t.name.includes('Siêu Cúp 16 Đội')) {
        tournamentName = 'SLAY TOURNAMENT';
        tournamentDesc = 'Tournament Discord Server Slay';
        gameCat = 'custom';
        customGameName = 'S L A Y';
      }

      if (t.format === 'single_elimination') {
        const totalWinnersRounds = t.rounds.filter(r => r.bracketSection === 'winners').length;
        // If an old 8-team bracket had only 3 rounds, regenerate it to have full 4 rounds (Vòng Loại -> Tứ Kết -> Bán Kết -> Chung Kết)
        if (totalWinnersRounds < 4 && t.participants.length <= 8) {
          const matchingPreset = SAMPLE_PARTICIPANTS_5V5_VALORANT;
          const updatedParticipants = t.participants.length >= 8 ? SAMPLE_PARTICIPANTS_5V5_VALORANT : t.participants;
          const newRounds = generateSingleElimination(updatedParticipants, t.settings);
          return { ...t, name: tournamentName, description: tournamentDesc, game: gameCat, customGameName, participants: updatedParticipants, rounds: newRounds };
        }

        const updatedRounds = t.rounds.map(r => {
          if (r.bracketSection === 'winners') {
            return {
              ...r,
              name: getRoundName(r.roundIndex, totalWinnersRounds, 'winners'),
            };
          }
          return r;
        });
        return { ...t, name: tournamentName, description: tournamentDesc, game: gameCat, customGameName, rounds: updatedRounds };
      }
      return { ...t, name: tournamentName, description: tournamentDesc, game: gameCat, customGameName };
    });

    saveTournaments(normalized);
    return normalized;
  } catch {
    const initial = createInitialTournaments();
    return initial;
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  } catch (err) {
    console.error('Error saving tournaments to localStorage:', err);
  }
}

export function createDefaultTournament(): Tournament {
  return createInitialTournaments()[0];
}

export function getAdminAuthState(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthState(isAuth: boolean): void {
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, isAuth ? 'true' : 'false');
  } catch (err) {
    console.error('Error setting admin auth:', err);
  }
}

export function exportTournamentsToJSON(tournaments: Tournament[]): string {
  return JSON.stringify(tournaments, null, 2);
}

export function importTournamentsFromJSON(jsonString: string): Tournament[] | null {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data) && data.length > 0 && data[0].id && data[0].participants) {
      return data as Tournament[];
    }
    if (data.id && data.participants) {
      return [data as Tournament];
    }
    return null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------------
// BACKEND API & CLOUD DATABASE SYNC HELPERS (Render + Firebase)
// -------------------------------------------------------------------
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function fetchTournamentsFromAPI(): Promise<Tournament[] | null> {
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/tournaments` : '/api/tournaments';
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      saveTournaments(data); // Sync local cache
      return data as Tournament[];
    }
    return null;
  } catch (err) {
    console.warn('API fetch tournaments failed, using local cache:', err);
    return null;
  }
}

export async function syncTournamentsToAPI(tournaments: Tournament[]): Promise<boolean> {
  saveTournaments(tournaments); // Always update local cache
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/tournaments` : '/api/tournaments';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tournaments),
    });
    return res.ok;
  } catch (err) {
    console.warn('API sync tournaments failed:', err);
    return false;
  }
}

export async function fetchMastersFromAPI(): Promise<any[] | null> {
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/that-tuyet-masters` : '/api/that-tuyet-masters';
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('API fetch masters failed:', err);
    return null;
  }
}

export async function syncMastersToAPI(masters: any[]): Promise<boolean> {
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/that-tuyet-masters` : '/api/that-tuyet-masters';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(masters),
    });
    return res.ok;
  } catch (err) {
    console.warn('API sync masters failed:', err);
    return false;
  }
}


