import { Match, Participant, Round, Tournament, BracketType, GameCategory } from '../types/tournament';

// Helper to get next power of 2
export function getNextPowerOfTwo(n: number): number {
  if (n <= 2) return 2;
  let p = 1;
  while (p < n) {
    p *= 2;
  }
  return p;
}

// Generate seeded positions: e.g. for 8 seeds: [1, 8, 4, 5, 2, 7, 3, 6]
export function generateSeededOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const nextOrder: number[] = [];
    const sum = order.length * 2 + 1;
    for (const seed of order) {
      nextOrder.push(seed);
      nextOrder.push(sum - seed);
    }
    order = nextOrder;
  }
  return order;
}

export function getRoundName(
  roundIndex: number,
  totalRounds: number,
  section: 'winners' | 'losers' | 'grand_final' | 'third_place' | 'group_stage' = 'winners'
): string {
  if (section === 'grand_final') return 'Chung Kết Tổng (Grand Finals)';
  if (section === 'third_place') return 'Tranh Hạng 3 (3rd Place)';
  if (section === 'group_stage') return `Vòng Bảng - Lượt ${roundIndex + 1}`;
  
  if (section === 'losers') {
    return `Nhánh Thua (LB) - Vòng ${roundIndex + 1}`;
  }
  
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return 'Chung Kết (Finals)';
  if (fromEnd === 1) return 'Bán Kết (Semi-Finals)';
  if (fromEnd === 2) return 'Tứ Kết (Quarter-Finals)';
  if (fromEnd === 3) return 'Vòng 1/8 (Round of 16)';
  if (fromEnd === 4) return 'Vòng Sơ Loại (Play-In / Round of 32)';
  return `Vòng Loại ${roundIndex + 1}`;
}

// Helper to determine Best Of for a specific round based on stage settings
export function getBestOfForRound(
  roundIndex: number,
  totalRounds: number,
  settings: Tournament['settings'],
  section: 'winners' | 'losers' | 'grand_final' | 'third_place' | 'group_stage' = 'winners'
): number {
  if (section === 'grand_final') return settings.finalsBestOf || 3;
  if (section === 'third_place') return settings.semisBestOf || settings.defaultBestOf || 3;
  if (section === 'group_stage') return settings.defaultBestOf || 1;

  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return settings.finalsBestOf || 3;
  if (fromEnd === 1) return settings.semisBestOf || 3;
  if (fromEnd === 2 && settings.quartersBestOf) return settings.quartersBestOf;
  return settings.defaultBestOf || 1;
}

// Generate Single Elimination Bracket
export function generateSingleElimination(
  participants: Participant[],
  settings: Tournament['settings']
): Round[] {
  const count = participants.length;
  if (count < 2) return [];

  // Dynamic bracket size based on participants (e.g. 4 -> 4, 8 -> 8, 16 -> 16, 32 -> 32)
  const bracketSize = Math.max(2, getNextPowerOfTwo(count));
  const numRounds = Math.log2(bracketSize);
  const seedOrder = generateSeededOrder(bracketSize);

  // Map participants to seed positions (1-indexed)
  const seededParticipants = seedOrder.map((seed) => {
    return participants.find((p) => p.seed === seed) || null;
  });

  const rounds: Round[] = [];

  // Create empty matches for all rounds
  for (let r = 0; r < numRounds; r++) {
    const matchesInRound = bracketSize / Math.pow(2, r + 1);
    const roundBestOf = getBestOfForRound(r, numRounds, settings, 'winners');
    
    const roundMatches: Match[] = [];
    for (let m = 0; m < matchesInRound; m++) {
      const matchId = `match-r${r}-m${m}`;
      const nextMatchId = r < numRounds - 1 ? `match-r${r + 1}-m${Math.floor(m / 2)}` : undefined;
      const nextMatchSlot = (m % 2 === 0 ? 1 : 2) as 1 | 2;

      roundMatches.push({
        id: matchId,
        roundIndex: r,
        matchIndex: m,
        bracketSection: 'winners',
        score1: 0,
        score2: 0,
        bestOf: roundBestOf,
        status: 'pending',
        nextMatchId,
        nextMatchSlot,
        voiceChannel: `🔊 Voice Bàn ${m + 1}`,
      });
    }

    rounds.push({
      id: `round-${r}`,
      name: getRoundName(r, numRounds, 'winners'),
      bracketSection: 'winners',
      roundIndex: r,
      bestOf: roundBestOf,
      matches: roundMatches,
    });
  }

  // Populate Round 0 with seeded participants
  const r0Matches = rounds[0].matches;
  for (let m = 0; m < r0Matches.length; m++) {
    const p1 = seededParticipants[m * 2];
    const p2 = seededParticipants[m * 2 + 1];

    r0Matches[m].participant1Id = p1 ? p1.id : undefined;
    r0Matches[m].participant2Id = p2 ? p2.id : undefined;

    // Handle BYEs
    if (p1 && !p2) {
      r0Matches[m].status = 'finished';
      r0Matches[m].winnerId = p1.id;
      r0Matches[m].score1 = 0;
      r0Matches[m].notes = 'Đặc cách vào vòng sau (BYE)';
      // Advance to next round immediately
      if (r0Matches[m].nextMatchId && rounds[1]) {
        const nextMatch = rounds[1].matches.find(match => match.id === r0Matches[m].nextMatchId);
        if (nextMatch) {
          if (r0Matches[m].nextMatchSlot === 1) nextMatch.participant1Id = p1.id;
          else nextMatch.participant2Id = p1.id;
        }
      }
    } else if (!p1 && p2) {
      r0Matches[m].status = 'finished';
      r0Matches[m].winnerId = p2.id;
      r0Matches[m].score2 = 0;
      r0Matches[m].notes = 'Đặc cách vào vòng sau (BYE)';
      if (r0Matches[m].nextMatchId && rounds[1]) {
        const nextMatch = rounds[1].matches.find(match => match.id === r0Matches[m].nextMatchId);
        if (nextMatch) {
          if (r0Matches[m].nextMatchSlot === 1) nextMatch.participant1Id = p2.id;
          else nextMatch.participant2Id = p2.id;
        }
      }
    } else if (p1 && p2) {
      r0Matches[m].status = 'ready';
    }
  }

  // Check Round 1 matches readiness after byes
  if (rounds.length > 1) {
    rounds[1].matches.forEach(m => {
      if (m.participant1Id && m.participant2Id) {
        m.status = 'ready';
      }
    });
  }

  // Optional 3rd place match
  if (settings.hasThirdPlaceMatch && numRounds >= 2) {
    rounds.push({
      id: 'round-third-place',
      name: 'Tranh Hạng 3 (3rd Place Match)',
      bracketSection: 'third_place',
      roundIndex: numRounds,
      bestOf: settings.semisBestOf || settings.defaultBestOf || 3,
      matches: [{
        id: 'match-third-place',
        roundIndex: numRounds,
        matchIndex: 0,
        bracketSection: 'third_place',
        score1: 0,
        score2: 0,
        bestOf: settings.semisBestOf || settings.defaultBestOf || 3,
        status: 'pending',
        voiceChannel: '🔊 Voice Tranh Hạng 3',
      }],
    });
  }

  return rounds;
}

// Generate Double Elimination Bracket
export function generateDoubleElimination(
  participants: Participant[],
  settings: Tournament['settings']
): Round[] {
  const count = participants.length;
  if (count < 4) return generateSingleElimination(participants, settings);

  const bracketSize = getNextPowerOfTwo(count);
  const numRoundsUpper = Math.log2(bracketSize);
  const seedOrder = generateSeededOrder(bracketSize);

  const seededParticipants = seedOrder.map((seed) => {
    return participants.find((p) => p.seed === seed) || null;
  });

  const rounds: Round[] = [];

  // Upper Bracket Rounds (WB)
  for (let r = 0; r < numRoundsUpper; r++) {
    const matchesInRound = bracketSize / Math.pow(2, r + 1);
    const roundBestOf = getBestOfForRound(r, numRoundsUpper, settings, 'winners');
    const roundMatches: Match[] = [];

    for (let m = 0; m < matchesInRound; m++) {
      const matchId = `wb-r${r}-m${m}`;
      const nextMatchId = r < numRoundsUpper - 1 ? `wb-r${r + 1}-m${Math.floor(m / 2)}` : 'grand-final-m0';
      const nextMatchSlot = (r === numRoundsUpper - 1 ? 1 : (m % 2 === 0 ? 1 : 2)) as 1 | 2;

      roundMatches.push({
        id: matchId,
        roundIndex: r,
        matchIndex: m,
        bracketSection: 'winners',
        score1: 0,
        score2: 0,
        bestOf: roundBestOf,
        status: 'pending',
        nextMatchId,
        nextMatchSlot,
        voiceChannel: `🔊 Voice WB Bàn ${m + 1}`,
      });
    }

    rounds.push({
      id: `wb-round-${r}`,
      name: `Nhánh Thắng (WB) - ${getRoundName(r, numRoundsUpper, 'winners')}`,
      bracketSection: 'winners',
      roundIndex: r,
      bestOf: roundBestOf,
      matches: roundMatches,
    });
  }

  // Populate Round 0 WB
  const wb0Matches = rounds[0].matches;
  for (let m = 0; m < wb0Matches.length; m++) {
    const p1 = seededParticipants[m * 2];
    const p2 = seededParticipants[m * 2 + 1];

    wb0Matches[m].participant1Id = p1 ? p1.id : undefined;
    wb0Matches[m].participant2Id = p2 ? p2.id : undefined;

    if (p1 && !p2) {
      wb0Matches[m].status = 'finished';
      wb0Matches[m].winnerId = p1.id;
      wb0Matches[m].score1 = 0;
      wb0Matches[m].notes = 'Đặc cách vào vòng sau (BYE)';
      if (wb0Matches[m].nextMatchId && rounds[1]) {
        const next = rounds[1].matches.find(mt => mt.id === wb0Matches[m].nextMatchId);
        if (next) {
          if (wb0Matches[m].nextMatchSlot === 1) next.participant1Id = p1.id;
          else next.participant2Id = p1.id;
        }
      }
    } else if (!p1 && p2) {
      wb0Matches[m].status = 'finished';
      wb0Matches[m].winnerId = p2.id;
      wb0Matches[m].score2 = 0;
      wb0Matches[m].notes = 'Đặc cách vào vòng sau (BYE)';
      if (wb0Matches[m].nextMatchId && rounds[1]) {
        const next = rounds[1].matches.find(mt => mt.id === wb0Matches[m].nextMatchId);
        if (next) {
          if (wb0Matches[m].nextMatchSlot === 1) next.participant1Id = p2.id;
          else next.participant2Id = p2.id;
        }
      }
    } else if (p1 && p2) {
      wb0Matches[m].status = 'ready';
    }
  }

  // Lower Bracket Rounds (LB)
  const numRoundsLower = (numRoundsUpper - 1) * 2;
  for (let lr = 0; lr < numRoundsLower; lr++) {
    const matchesInRound = Math.max(1, Math.floor(bracketSize / Math.pow(2, Math.floor(lr / 2) + 2)));
    const roundMatches: Match[] = [];

    for (let lm = 0; lm < matchesInRound; lm++) {
      const matchId = `lb-r${lr}-m${lm}`;
      const nextMatchId = lr < numRoundsLower - 1 
        ? (lr % 2 === 0 ? `lb-r${lr + 1}-m${lm}` : `lb-r${lr + 1}-m${Math.floor(lm / 2)}`) 
        : 'grand-final-m0';
      const nextMatchSlot = (lr === numRoundsLower - 1 ? 2 : (lr % 2 === 0 ? 1 : (lm % 2 === 0 ? 1 : 2))) as 1 | 2;

      roundMatches.push({
        id: matchId,
        roundIndex: lr,
        matchIndex: lm,
        bracketSection: 'losers',
        score1: 0,
        score2: 0,
        bestOf: settings.defaultBestOf || 1,
        status: 'pending',
        nextMatchId,
        nextMatchSlot,
        voiceChannel: `🔊 Voice LB Bàn ${lm + 1}`,
      });
    }

    rounds.push({
      id: `lb-round-${lr}`,
      name: `Nhánh Thua (LB) - Vòng ${lr + 1}`,
      bracketSection: 'losers',
      roundIndex: lr,
      bestOf: settings.defaultBestOf || 1,
      matches: roundMatches,
    });
  }

  // Grand Finals
  rounds.push({
    id: 'grand-final-round',
    name: 'Chung Kết Tổng (Grand Finals)',
    bracketSection: 'grand_final',
    roundIndex: 99,
    bestOf: settings.finalsBestOf || 3,
    matches: [
      {
        id: 'grand-final-m0',
        roundIndex: 99,
        matchIndex: 0,
        bracketSection: 'grand_final',
        score1: 0,
        score2: 0,
        bestOf: settings.finalsBestOf || 3,
        status: 'pending',
        voiceChannel: '🔊 Voice Chung Kết Tổng',
      },
    ],
  });

  return rounds;
}

// Generate Round Robin
export function generateRoundRobin(
  participants: Participant[],
  settings: Tournament['settings']
): Round[] {
  const count = participants.length;
  if (count < 2) return [];

  const list: (Participant | null)[] = [...participants];
  if (list.length % 2 !== 0) {
    list.push(null); // Dummy player for BYE
  }

  const numPlayers = list.length;
  const numRounds = numPlayers - 1;
  const matchesPerRound = numPlayers / 2;
  const rounds: Round[] = [];

  for (let r = 0; r < numRounds; r++) {
    const roundMatches: Match[] = [];

    for (let m = 0; m < matchesPerRound; m++) {
      const p1 = list[m];
      const p2 = list[numPlayers - 1 - m];

      const matchId = `rr-r${r}-m${m}`;
      const match: Match = {
        id: matchId,
        roundIndex: r,
        matchIndex: m,
        bracketSection: 'group_stage',
        participant1Id: p1 ? p1.id : undefined,
        participant2Id: p2 ? p2.id : undefined,
        score1: 0,
        score2: 0,
        bestOf: settings.defaultBestOf || 1,
        status: (p1 && p2) ? 'ready' : 'finished',
        voiceChannel: `🔊 Voice Bàn ${m + 1}`,
      };

      if (p1 && !p2) {
        match.winnerId = p1.id;
        match.notes = 'Miễn đấu (BYE)';
      } else if (!p1 && p2) {
        match.winnerId = p2.id;
        match.notes = 'Miễn đấu (BYE)';
      }

      roundMatches.push(match);
    }

    rounds.push({
      id: `rr-round-${r}`,
      name: `Vòng Bảng - Lượt ${r + 1}`,
      bracketSection: 'group_stage',
      roundIndex: r,
      bestOf: settings.defaultBestOf || 1,
      matches: roundMatches,
    });

    // Rotate array: keep list[0] fixed, rotate the rest
    const fixed = list[0];
    const rest = list.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    list.splice(0, list.length, fixed, ...rest);
  }

  return rounds;
}

// Calculate Round Robin Standings with custom rules support
export function calculateRoundRobinStandings(
  participants: Participant[],
  rounds: Round[],
  customRules?: Tournament['settings']['rulesConfig']
): Participant[] {
  const winPts = customRules?.winPoints ?? 3;
  const drawPts = customRules?.drawPoints ?? 1;
  const lossPts = customRules?.lossPoints ?? 0;
  const bonusPerRound = customRules?.bonusPointPerRoundWin ?? false;
  const tieBreakRule = customRules?.tieBreakRule ?? 'round_diff';

  // Direct head-to-head tracking map: Map<`${p1Id}_${p2Id}`, number of wins>
  const headToHead = new Map<string, number>();

  const statsMap = new Map<string, {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    roundsWon: number;
    roundsLost: number;
    points: number;
  }>();

  participants.forEach(p => {
    statsMap.set(p.id, {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      roundsWon: 0,
      roundsLost: 0,
      points: 0,
    });
  });

  rounds.forEach(r => {
    r.matches.forEach(m => {
      if (m.status === 'finished' && m.participant1Id && m.participant2Id) {
        const p1Stats = statsMap.get(m.participant1Id);
        const p2Stats = statsMap.get(m.participant2Id);

        if (p1Stats && p2Stats) {
          p1Stats.matchesPlayed += 1;
          p2Stats.matchesPlayed += 1;
          p1Stats.roundsWon += m.score1;
          p1Stats.roundsLost += m.score2;
          p2Stats.roundsWon += m.score2;
          p2Stats.roundsLost += m.score1;

          if (bonusPerRound) {
            p1Stats.points += m.score1;
            p2Stats.points += m.score2;
          }

          if (m.score1 > m.score2) {
            p1Stats.wins += 1;
            p1Stats.points += winPts;
            p2Stats.losses += 1;
            p2Stats.points += lossPts;
            headToHead.set(`${m.participant1Id}_${m.participant2Id}`, (headToHead.get(`${m.participant1Id}_${m.participant2Id}`) || 0) + 1);
          } else if (m.score2 > m.score1) {
            p2Stats.wins += 1;
            p2Stats.points += winPts;
            p1Stats.losses += 1;
            p1Stats.points += lossPts;
            headToHead.set(`${m.participant2Id}_${m.participant1Id}`, (headToHead.get(`${m.participant2Id}_${m.participant1Id}`) || 0) + 1);
          } else {
            // Draw (e.g. BO2 1-1)
            p1Stats.draws += 1;
            p2Stats.draws += 1;
            p1Stats.points += drawPts;
            p2Stats.points += drawPts;
          }
        }
      }
    });
  });

  const updated = participants.map(p => {
    const s = statsMap.get(p.id);
    return {
      ...p,
      stats: s || {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        roundsWon: 0,
        roundsLost: 0,
        points: 0,
      }
    };
  });

  // Sort based on Points & selected tie break rule
  return updated.sort((a, b) => {
    const aPts = a.stats?.points || 0;
    const bPts = b.stats?.points || 0;
    if (bPts !== aPts) return bPts - aPts;

    // Tie break 1: Head-to-Head if applicable
    if (tieBreakRule === 'head_to_head') {
      const aVsB = headToHead.get(`${a.id}_${b.id}`) || 0;
      const bVsA = headToHead.get(`${b.id}_${a.id}`) || 0;
      if (aVsB !== bVsA) return bVsA - aVsB;
    }

    // Tie break 2: Round difference
    const aDiff = (a.stats?.roundsWon || 0) - (a.stats?.roundsLost || 0);
    const bDiff = (b.stats?.roundsWon || 0) - (b.stats?.roundsLost || 0);
    if (bDiff !== aDiff) return bDiff - aDiff;

    // Tie break 3: Rounds won total
    return (b.stats?.roundsWon || 0) - (a.stats?.roundsWon || 0);
  });
}

// -------------------------------------------------------------
// AUTOMATIC TOURNAMENT SCHEDULER ENGINE
// -------------------------------------------------------------
export interface AutoScheduleOptions {
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  matchDurationMinutes: number; // e.g. 35 mins
  bufferTimeMinutes: number; // e.g. 10 mins break between matches
  concurrentStreams: number; // e.g. 1 (sequential), 2, 4 (simultaneous tables)
  voiceRoomPrefix?: string; // e.g. "🔊 Voice Bàn"
}

export function autoGenerateTournamentSchedule(
  tournament: Tournament,
  options: AutoScheduleOptions
): Tournament {
  const {
    startDate,
    startTime,
    matchDurationMinutes,
    bufferTimeMinutes,
    concurrentStreams = 1,
    voiceRoomPrefix = '🔊 Voice Bàn',
  } = options;

  const validStreams = Math.max(1, concurrentStreams);
  const [startHour, startMinute] = startTime.split(':').map((v) => parseInt(v) || 0);
  
  // Parse base start date
  const startDateTime = new Date(`${startDate}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`);
  let currentTimestampMs = isNaN(startDateTime.getTime()) ? Date.now() : startDateTime.getTime();

  const newRounds = JSON.parse(JSON.stringify(tournament.rounds)) as Round[];

  // Helper to format nice readable date string
  const formatTimeSlot = (ms: number): { formatted: string; timestampSec: number } => {
    const d = new Date(ms);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return {
      formatted: `${hours}:${mins} ${day}/${month}`,
      timestampSec: Math.floor(ms / 1000),
    };
  };

  // Schedule round by round
  newRounds.forEach((round, roundIdx) => {
    const matches = round.matches;
    if (matches.length === 0) return;

    // Time required per match slot (scaled by best of if applicable)
    const slotDurationMs = (matchDurationMinutes + bufferTimeMinutes) * 60 * 1000;
    
    // Group matches into waves based on concurrent streams
    matches.forEach((match, matchIdx) => {
      const waveIndex = Math.floor(matchIdx / validStreams);
      const streamIndex = (matchIdx % validStreams) + 1;

      const matchStartMs = currentTimestampMs + waveIndex * slotDurationMs;
      const { formatted, timestampSec } = formatTimeSlot(matchStartMs);

      match.scheduledTime = formatted;
      match.scheduledTimestamp = timestampSec;
      match.voiceChannel = `${voiceRoomPrefix} ${streamIndex}`;
    });

    // Advance global time for next round (all waves in this round must conclude)
    const totalWavesInRound = Math.ceil(matches.length / validStreams);
    currentTimestampMs += totalWavesInRound * slotDurationMs + (bufferTimeMinutes * 60 * 1000);
  });

  return {
    ...tournament,
    rounds: newRounds,
    settings: {
      ...tournament.settings,
      scheduleConfig: {
        startDate,
        startTime,
        matchDurationMinutes,
        bufferTimeMinutes,
        concurrentStreams: validStreams,
        voiceRoomPrefix,
      },
    },
    updatedAt: Date.now(),
  };
}

// Helper to generate rounds for a single division
export function generateRoundsForDivision(
  participants: Participant[],
  format: BracketType,
  settings: Tournament['settings']
): Round[] {
  if (format === 'single_elimination') {
    return generateSingleElimination(participants, settings);
  } else if (format === 'double_elimination') {
    return generateDoubleElimination(participants, settings);
  } else {
    return generateRoundRobin(participants, settings);
  }
}

// Advance Match logic (supports single tournament and multi-division tournaments)
export function advanceMatchWinner(
  tournament: Tournament,
  matchId: string,
  winnerId: string,
  score1: number,
  score2: number,
  mapPicked?: string,
  mvp?: string
): Tournament {
  // If tournament has divisions, find which division owns this match
  if (tournament.divisions && tournament.divisions.length > 0) {
    let targetDivIndex = -1;
    let divMatchFound = false;

    // Check active division first, then others
    const activeIdx = tournament.divisions.findIndex(d => d.id === tournament.activeDivisionId);
    if (activeIdx !== -1) {
      const existsInActive = tournament.divisions[activeIdx].rounds.some(r => r.matches.some(m => m.id === matchId));
      if (existsInActive) {
        targetDivIndex = activeIdx;
        divMatchFound = true;
      }
    }

    if (!divMatchFound) {
      targetDivIndex = tournament.divisions.findIndex(d => d.rounds.some(r => r.matches.some(m => m.id === matchId)));
    }

    if (targetDivIndex !== -1) {
      const targetDiv = tournament.divisions[targetDivIndex];
      // Create a temporary mock tournament to advance in division
      const tempTour: Tournament = {
        ...tournament,
        format: targetDiv.format || tournament.format,
        rounds: targetDiv.rounds,
        participants: targetDiv.participants,
        championId: targetDiv.championId,
        runnerUpId: targetDiv.runnerUpId,
      };

      const advancedTemp = advanceMatchSingleInternal(tempTour, matchId, winnerId, score1, score2, mapPicked, mvp);

      const updatedDivisions = [...tournament.divisions];
      updatedDivisions[targetDivIndex] = {
        ...targetDiv,
        rounds: advancedTemp.rounds,
        championId: advancedTemp.championId,
        runnerUpId: advancedTemp.runnerUpId,
        status: advancedTemp.status,
      };

      const isCurrentActive = tournament.activeDivisionId === targetDiv.id || !tournament.activeDivisionId;

      return {
        ...tournament,
        divisions: updatedDivisions,
        rounds: isCurrentActive ? advancedTemp.rounds : tournament.rounds,
        participants: isCurrentActive ? advancedTemp.participants : tournament.participants,
        championId: isCurrentActive ? advancedTemp.championId : tournament.championId,
        runnerUpId: isCurrentActive ? advancedTemp.runnerUpId : tournament.runnerUpId,
        updatedAt: Date.now(),
      };
    }
  }

  // Single bracket fallback
  return advanceMatchSingleInternal(tournament, matchId, winnerId, score1, score2, mapPicked, mvp);
}

function advanceMatchSingleInternal(
  tournament: Tournament,
  matchId: string,
  winnerId: string,
  score1: number,
  score2: number,
  mapPicked?: string,
  mvp?: string
): Tournament {
  const newRounds = JSON.parse(JSON.stringify(tournament.rounds)) as Round[];
  let currentMatch: Match | undefined;
  let currentRoundIndex = -1;

  for (let r = 0; r < newRounds.length; r++) {
    const found = newRounds[r].matches.find(m => m.id === matchId);
    if (found) {
      currentMatch = found;
      currentRoundIndex = r;
      break;
    }
  }

  if (!currentMatch) return tournament;

  const loserId = currentMatch.participant1Id === winnerId 
    ? currentMatch.participant2Id 
    : currentMatch.participant1Id;

  currentMatch.winnerId = winnerId;
  currentMatch.loserId = loserId;
  currentMatch.score1 = score1;
  currentMatch.score2 = score2;
  currentMatch.status = 'finished';
  if (mapPicked) currentMatch.mapPicked = mapPicked;
  if (mvp) currentMatch.mvp = mvp;

  // Advance winner to next match in winners / bracket flow
  if (currentMatch.nextMatchId) {
    for (const round of newRounds) {
      const nextMatch = round.matches.find(m => m.id === currentMatch!.nextMatchId);
      if (nextMatch) {
        if (currentMatch.nextMatchSlot === 1) {
          nextMatch.participant1Id = winnerId;
        } else {
          nextMatch.participant2Id = winnerId;
        }
        if (nextMatch.participant1Id && nextMatch.participant2Id) {
          nextMatch.status = 'ready';
        }
        break;
      }
    }
  }

  // Advance loser in Double Elimination if applicable
  if (tournament.format === 'double_elimination' && currentMatch.bracketSection === 'winners' && loserId) {
    // Drop to Lower Bracket
    const targetRoundIdx = Math.max(0, currentRoundIndex * 2);
    const lbRound = newRounds.find(r => r.bracketSection === 'losers' && r.roundIndex === targetRoundIdx);
    if (lbRound) {
      const lbMatch = lbRound.matches.find(m => !m.participant1Id || !m.participant2Id);
      if (lbMatch) {
        if (!lbMatch.participant1Id) lbMatch.participant1Id = loserId;
        else if (!lbMatch.participant2Id) lbMatch.participant2Id = loserId;

        if (lbMatch.participant1Id && lbMatch.participant2Id) {
          lbMatch.status = 'ready';
        }
      }
    }
  }

  // Check for Tournament Champion
  let championId = tournament.championId;
  let runnerUpId = tournament.runnerUpId;

  if (currentMatch.bracketSection === 'grand_final' || (tournament.format === 'single_elimination' && currentRoundIndex === newRounds.length - (tournament.settings.hasThirdPlaceMatch ? 2 : 1))) {
    championId = winnerId;
    runnerUpId = loserId;
  }

  return {
    ...tournament,
    rounds: newRounds,
    updatedAt: Date.now(),
    championId,
    runnerUpId,
    status: championId ? 'completed' : 'ongoing',
  };
}

