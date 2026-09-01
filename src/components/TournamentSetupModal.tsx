import React, { useState } from 'react';
import {
  Tournament,
  Participant,
  BracketType,
  GameCategory,
  DraftMode,
  SideSelectionRule,
  TieBreakRule,
  TournamentRules,
  TournamentPrizes,
  TournamentDivision,
} from '../types/tournament';
import {
  GAME_PRESETS,
  SAMPLE_SECT_DIVISIONS,
} from '../data/presets';
import {
  generateSingleElimination,
  generateDoubleElimination,
  generateRoundRobin,
  generateRoundsForDivision,
  autoGenerateTournamentSchedule,
} from '../utils/bracketGenerator';
import { PrizeSetupTab } from './PrizeSetupTab';
import { DivisionSetupTab } from './DivisionSetupTab';
import {
  X,
  Sparkles,
  Trophy,
  Users,
  Shuffle,
  Plus,
  Trash2,
  Settings2,
  Check,
  Shield,
  Calendar,
  Clock,
  Swords,
  Layers,
  Flame,
  Award,
  FileText,
  Gift,
  GripVertical,
  ArrowUpDown,
} from 'lucide-react';

interface TournamentSetupModalProps {
  initialTournament?: Tournament | null;
  onClose: () => void;
  onSaveTournament: (tournament: Tournament) => void;
}

export const TournamentSetupModal: React.FC<TournamentSetupModalProps> = ({
  initialTournament,
  onClose,
  onSaveTournament,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [name, setName] = useState<string>(
    initialTournament?.name || 'Giải Custom ARAM 5v5 Discord Night Cup'
  );
  const [description, setDescription] = useState<string>(
    initialTournament?.description || 'Giải đấu giao lưu gắn kết anh em Discord server'
  );
  const [game, setGame] = useState<GameCategory>(initialTournament?.game || 'lol_aram');
  const [customGameName, setCustomGameName] = useState<string>(initialTournament?.customGameName || '');
  const [format, setFormat] = useState<BracketType>(initialTournament?.format || 'single_elimination');

  // Stage Best Of Rules
  const [defaultBestOf, setDefaultBestOf] = useState<number>(
    initialTournament?.settings.defaultBestOf || 1
  );
  const [quartersBestOf, setQuartersBestOf] = useState<number>(
    initialTournament?.settings.quartersBestOf || 3
  );
  const [semisBestOf, setSemisBestOf] = useState<number>(
    initialTournament?.settings.semisBestOf || 3
  );
  const [finalsBestOf, setFinalsBestOf] = useState<number>(
    initialTournament?.settings.finalsBestOf || 5
  );
  const [hasThirdPlaceMatch, setHasThirdPlaceMatch] = useState<boolean>(
    initialTournament?.settings.hasThirdPlaceMatch ?? true
  );

  // Draft & Ban/Pick Rules
  const [draftMode, setDraftMode] = useState<DraftMode>(
    initialTournament?.settings.rulesConfig?.draftMode || 'tournament_draft'
  );
  const [bansPerTeam, setBansPerTeam] = useState<number>(
    initialTournament?.settings.rulesConfig?.bansPerTeam ?? 5
  );
  const [sideSelection, setSideSelection] = useState<SideSelectionRule>(
    initialTournament?.settings.rulesConfig?.sideSelection || 'coin_toss'
  );

  // Points & Scoring System (for Round Robin)
  const [winPoints, setWinPoints] = useState<number>(
    initialTournament?.settings.rulesConfig?.winPoints ?? 3
  );
  const [drawPoints, setDrawPoints] = useState<number>(
    initialTournament?.settings.rulesConfig?.drawPoints ?? 1
  );
  const [lossPoints, setLossPoints] = useState<number>(
    initialTournament?.settings.rulesConfig?.lossPoints ?? 0
  );
  const [bonusPointPerRoundWin, setBonusPointPerRoundWin] = useState<boolean>(
    initialTournament?.settings.rulesConfig?.bonusPointPerRoundWin ?? false
  );
  const [tieBreakRule, setTieBreakRule] = useState<TieBreakRule>(
    initialTournament?.settings.rulesConfig?.tieBreakRule || 'head_to_head'
  );

  // 1v1 Win condition
  const [winCondition1v1, setWinCondition1v1] = useState<'standard' | 'first_blood_tower_100cs' | 'first_to_2_kills'>(
    initialTournament?.settings.rulesConfig?.winCondition1v1 || 'first_blood_tower_100cs'
  );
  const [maxPauseMinutes, setMaxPauseMinutes] = useState<number>(
    initialTournament?.settings.rulesConfig?.maxPauseMinutes || 10
  );

  // Schedule auto-generation on create
  const defaultToday = new Date().toISOString().split('T')[0];
  const [enableAutoSchedule, setEnableAutoSchedule] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>(
    initialTournament?.settings.scheduleConfig?.startDate || defaultToday
  );
  const [startTime, setStartTime] = useState<string>(
    initialTournament?.settings.scheduleConfig?.startTime || '20:00'
  );
  const [matchDuration, setMatchDuration] = useState<number>(
    initialTournament?.settings.scheduleConfig?.matchDurationMinutes || 35
  );
  const [bufferTime, setBufferTime] = useState<number>(
    initialTournament?.settings.scheduleConfig?.bufferTimeMinutes || 10
  );
  const [concurrentStreams, setConcurrentStreams] = useState<number>(
    initialTournament?.settings.scheduleConfig?.concurrentStreams || 2
  );

  // Discord & General Info
  const [prizePool, setPrizePool] = useState<string>(
    initialTournament?.settings.prizePool || '1.000.000 VNĐ + 11.500 VP + Role Champion 👑'
  );
  const [discordServerName, setDiscordServerName] = useState<string>(
    initialTournament?.settings.discordServerName || 'Tournament Discord Server Slay'
  );
  const [rulesText, setRulesText] = useState<string>(
    initialTournament?.settings.rulesText ||
      '1. Tập trung phòng voice trước 15p.\n2. Cấm trashtalk quá đà.\n3. Trọng tài có quyền quyết định cuối cùng.'
  );

  // --- TAB 4: TÙY CHỈNH 4 MỤC GIẢI THƯỞNG ---
  // 1. Tiền Mặt (Cash)
  const [cashEnabled, setCashEnabled] = useState<boolean>(
    initialTournament?.settings.prizes?.cash.enabled ?? true
  );
  const [cashTotal, setCashTotal] = useState<string>(
    initialTournament?.settings.prizes?.cash.totalAmount || '1.000.000 VNĐ'
  );
  const [cashChampion, setCashChampion] = useState<string>(
    initialTournament?.settings.prizes?.cash.champion || '600.000 VNĐ'
  );
  const [cashRunnerUp, setCashRunnerUp] = useState<string>(
    initialTournament?.settings.prizes?.cash.runnerUp || '300.000 VNĐ'
  );
  const [cashThirdPlace, setCashThirdPlace] = useState<string>(
    initialTournament?.settings.prizes?.cash.thirdPlace || '100.000 VNĐ'
  );
  const [cashMVP, setCashMVP] = useState<string>(
    initialTournament?.settings.prizes?.cash.mvp || '100.000 VNĐ'
  );
  const [cashPaymentMethod, setCashPaymentMethod] = useState<string>(
    initialTournament?.settings.prizes?.cash.paymentMethod || 'Chuyển khoản Banking / MoMo / ZaloPay'
  );

  // 2. Tiền In-Game (In-Game Currency)
  const [inGameEnabled, setInGameEnabled] = useState<boolean>(
    initialTournament?.settings.prizes?.inGame.enabled ?? true
  );
  const [inGameCurrencyName, setInGameCurrencyName] = useState<string>(
    initialTournament?.settings.prizes?.inGame.currencyName || (game === 'valorant_5v5' ? 'VP (Valorant Points)' : 'RP / VP / Kim Cương')
  );
  const [inGameTotal, setInGameTotal] = useState<string>(
    initialTournament?.settings.prizes?.inGame.totalAmount || '11.500 VP'
  );
  const [inGameChampion, setInGameChampion] = useState<string>(
    initialTournament?.settings.prizes?.inGame.champion || '5.500 VP'
  );
  const [inGameRunnerUp, setInGameRunnerUp] = useState<string>(
    initialTournament?.settings.prizes?.inGame.runnerUp || '3.500 VP'
  );
  const [inGameThirdPlace, setInGameThirdPlace] = useState<string>(
    initialTournament?.settings.prizes?.inGame.thirdPlace || '1.500 VP'
  );
  const [inGameMVP, setInGameMVP] = useState<string>(
    initialTournament?.settings.prizes?.inGame.mvp || '1.000 VP'
  );

  // 3. ROLE SERVER (Discord Roles)
  const [rolesEnabled, setRolesEnabled] = useState<boolean>(
    initialTournament?.settings.prizes?.roles.enabled ?? true
  );
  const [rolesChampion, setRolesChampion] = useState<string>(
    initialTournament?.settings.prizes?.roles.championRole || '👑 Slay Champion 2026'
  );
  const [rolesRunnerUp, setRolesRunnerUp] = useState<string>(
    initialTournament?.settings.prizes?.roles.runnerUpRole || '🥈 Á Quân Slay Cup'
  );
  const [rolesThirdPlace, setRolesThirdPlace] = useState<string>(
    initialTournament?.settings.prizes?.roles.thirdPlaceRole || '🥉 Hạng 3 Slay Cup'
  );
  const [rolesParticipant, setRolesParticipant] = useState<string>(
    initialTournament?.settings.prizes?.roles.participantRole || '🎖️ Slay Fighter'
  );
  const [rolesMVP, setRolesMVP] = useState<string>(
    initialTournament?.settings.prizes?.roles.mvpRole || '⭐ MVP Slay Tournament'
  );
  const [rolesPerks, setRolesPerks] = useState<string>(
    initialTournament?.settings.prizes?.roles.rolePerks || 'Huy hiệu Icon Server + Voice VIP Room + Tên màu sáng trên Discord'
  );

  // 4. Các phần thưởng khác (Other Rewards & Gifts)
  const [otherEnabled, setOtherEnabled] = useState<boolean>(
    initialTournament?.settings.prizes?.other.enabled ?? true
  );
  const [otherItems, setOtherItems] = useState<string[]>(
    initialTournament?.settings.prizes?.other.items || [
      '1 Tháng Discord Nitro Cho MVP',
      'Kỷ niệm chương / Cúp vinh danh Server Slay',
      'Áo thun đấu Slay độc quyền',
    ]
  );
  const [sponsorName, setSponsorName] = useState<string>(
    initialTournament?.settings.prizes?.other.sponsorName || 'BQT Server Discord Slay'
  );
  const [customPrizeNotes, setCustomPrizeNotes] = useState<string>(
    initialTournament?.settings.prizes?.other.customNotes || 'Trao giải trực tiếp trong vòng 24h sau trận Chung kết.'
  );

  // Participants
  const [participants, setParticipants] = useState<Participant[]>(
    initialTournament?.participants && initialTournament.participants.length > 0
      ? initialTournament.participants
      : []
  );

  // Multi-Division Support
  const [isMultiDivision, setIsMultiDivision] = useState<boolean>(
    initialTournament?.divisions && initialTournament.divisions.length > 0
      ? true
      : initialTournament?.game === 'lol_1v1'
  );

  const [divisions, setDivisions] = useState<TournamentDivision[]>(() => {
    if (initialTournament?.divisions && initialTournament.divisions.length > 0) {
      return initialTournament.divisions;
    }
    // Default 6 Sect Divisions for Nghich Thuy Han
    return SAMPLE_SECT_DIVISIONS.map((s) => ({
      id: `div-${s.sectKey}-${Date.now()}`,
      name: s.name,
      sectKey: s.sectKey,
      sectIcon: s.sectIcon,
      format: initialTournament?.format || 'single_elimination',
      participants: s.participants.map((p, idx) => ({
        id: `p-${s.sectKey}-${idx + 1}-${Date.now()}`,
        name: p.name,
        discordTag: p.discordTag,
        seed: idx + 1,
      })),
      rounds: [],
      status: 'draft',
    }));
  });

  const [bulkInput, setBulkInput] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamDiscord, setNewTeamDiscord] = useState<string>('');

  const handleSelectGamePreset = (preset: typeof GAME_PRESETS[0]) => {
    setGame(preset.id);
    setFormat(preset.defaultFormat);
    setDefaultBestOf(preset.defaultBestOf);
    if (preset.id === 'lol_1v1') {
      setName('Giải Tỉ Võ Lưu Phái 1v1 Nghịch Thủy Hàn');
      setIsMultiDivision(true);
      setDraftMode('solo_1v1_ban');
      setBansPerTeam(3);
      setWinCondition1v1('first_blood_tower_100cs');
    } else if (preset.id === 'lol_aram') {
      setName('Giải ARAM 5v5 Hỗn Chiến Cuối Tuần');
      setIsMultiDivision(false);
      setDraftMode('blind_pick');
      setBansPerTeam(0);
    } else if (preset.id === 'valorant_5v5') {
      setName('Giải Valorant 5v5 Discord Community Cup');
      setIsMultiDivision(false);
      setParticipants([]);
      setDraftMode('tournament_draft');
      setBansPerTeam(2);
    }
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const parsed: Participant[] = lines.map((line, idx) => {
      let name = line;
      let discordTag = '';

      if (line.includes('(') && line.includes(')')) {
        const parts = line.split('(');
        name = parts[0].trim();
        discordTag = parts[1].replace(')', '').trim();
      } else if (line.includes('@')) {
        const parts = line.split('@');
        name = parts[0].trim() || parts[1].trim();
        discordTag = `@${parts[1].trim()}`;
      }

      return {
        id: `p-${Date.now()}-${idx}`,
        name: name || `Đội ${idx + 1}`,
        discordTag: discordTag || undefined,
        seed: idx + 1,
      };
    });

    setParticipants(parsed);
    setBulkInput('');
  };

  const handleAddParticipant = () => {
    if (!newTeamName.trim()) return;
    const newP: Participant = {
      id: `p-${Date.now()}`,
      name: newTeamName.trim(),
      discordTag: newTeamDiscord.trim() || undefined,
      seed: participants.length + 1,
    };
    setParticipants([...participants, newP]);
    setNewTeamName('');
    setNewTeamDiscord('');
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleRemoveParticipant = (id: string) => {
    const updated = participants.filter((p) => p.id !== id).map((p, idx) => ({ ...p, seed: idx + 1 }));
    setParticipants(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const reordered = [...participants];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);
    const reseedeed = reordered.map((p, idx) => ({ ...p, seed: idx + 1 }));
    setParticipants(reseedeed);
    setDraggedIndex(null);
  };

  const handleShuffleSeeds = () => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const reseedeed = shuffled.map((p, idx) => ({ ...p, seed: idx + 1 }));
    setParticipants(reseedeed);
  };

  const getRoadmapStages = (count: number) => {
    if (count <= 8) return [
      { icon: '🛡️', name: '1. Tứ Kết (Quarter-Finals)', color: 'indigo' },
      { icon: '🔥', name: '2. Bán Kết (Semi-Finals)', color: 'slate' },
      { icon: '🏆', name: '3. Chung Kết (Finals)', color: 'amber' }
    ];
    if (count <= 16) return [
      { icon: '⚔️', name: '1. Vòng Loại (Vòng 1/8)', color: 'indigo' },
      { icon: '🛡️', name: '2. Tứ Kết (Quarter-Finals)', color: 'slate' },
      { icon: '🔥', name: '3. Bán Kết (Semi-Finals)', color: 'slate' },
      { icon: '🏆', name: '4. Chung Kết (Finals)', color: 'amber' }
    ];
    return [
      { icon: '⚡', name: '1. Vòng Sơ Loại (Play-In)', color: 'purple' },
      { icon: '⚔️', name: '2. Vòng 1/8 (Round of 16)', color: 'indigo' },
      { icon: '🛡️', name: '3. Tứ Kết (Quarter-Finals)', color: 'slate' },
      { icon: '🔥', name: '4. Bán Kết (Semi-Finals)', color: 'slate' },
      { icon: '🏆', name: '5. Chung Kết (Finals)', color: 'amber' }
    ];
  };

  const handleCreateTournament = () => {
    const rulesConfig: TournamentRules = {
      draftMode,
      bansPerTeam: Number(bansPerTeam),
      sideSelection,
      winPoints: Number(winPoints),
      drawPoints: Number(drawPoints),
      lossPoints: Number(lossPoints),
      bonusPointPerRoundWin,
      tieBreakRule,
      winCondition1v1: game === 'lol_1v1' ? winCondition1v1 : undefined,
      maxPauseMinutes: Number(maxPauseMinutes),
    };

    const prizesConfig: TournamentPrizes = {
      cash: {
        enabled: cashEnabled,
        totalAmount: cashTotal,
        champion: cashChampion,
        runnerUp: cashRunnerUp,
        thirdPlace: cashThirdPlace,
        mvp: cashMVP,
        paymentMethod: cashPaymentMethod,
      },
      inGame: {
        enabled: inGameEnabled,
        currencyName: inGameCurrencyName,
        totalAmount: inGameTotal,
        champion: inGameChampion,
        runnerUp: inGameRunnerUp,
        thirdPlace: inGameThirdPlace,
        mvp: inGameMVP,
      },
      roles: {
        enabled: rolesEnabled,
        championRole: rolesChampion,
        runnerUpRole: rolesRunnerUp,
        thirdPlaceRole: rolesThirdPlace,
        participantRole: rolesParticipant,
        mvpRole: rolesMVP,
        rolePerks: rolesPerks,
      },
      other: {
        enabled: otherEnabled,
        items: otherItems,
        sponsorName,
        customNotes: customPrizeNotes,
      },
    };

    // Calculate a summary text for prizePool
    const summaryPrizeParts: string[] = [];
    if (cashEnabled && cashTotal) summaryPrizeParts.push(`💵 ${cashTotal}`);
    if (inGameEnabled && inGameTotal) summaryPrizeParts.push(`🎮 ${inGameTotal}`);
    if (rolesEnabled && rolesChampion) summaryPrizeParts.push(`👑 ${rolesChampion}`);
    if (otherEnabled && otherItems.length > 0) summaryPrizeParts.push(`🎁 ${otherItems[0]}`);

    const finalPrizePool = summaryPrizeParts.length > 0 ? summaryPrizeParts.join(' + ') : prizePool;

    const settings: Tournament['settings'] = {
      hasThirdPlaceMatch,
      grandFinalReset: false,
      defaultBestOf: Number(defaultBestOf),
      quartersBestOf: Number(quartersBestOf),
      semisBestOf: Number(semisBestOf),
      finalsBestOf: Number(finalsBestOf),
      discordServerName,
      prizePool: finalPrizePool,
      prizes: prizesConfig,
      rulesText,
      rulesConfig,
      scheduleConfig: {
        startDate,
        startTime,
        matchDurationMinutes: Number(matchDuration),
        bufferTimeMinutes: Number(bufferTime),
        concurrentStreams: Number(concurrentStreams),
        voiceRoomPrefix: '🔊 Voice Bàn',
      },
    };

    let rounds = [];
    let finalDivisions: TournamentDivision[] | undefined = undefined;
    let finalParticipants: Participant[] = participants;

    if (isMultiDivision && divisions.length > 0) {
      for (const div of divisions) {
        if (div.participants.length < 2) {
          alert(`Bảng đấu "${div.name}" phải có ít nhất 2 người chơi tham gia!`);
          return;
        }
      }

      finalDivisions = divisions.map((div) => {
        const divFormat = div.format || format;
        const divRounds = generateRoundsForDivision(div.participants, divFormat, settings);
        return {
          ...div,
          format: divFormat,
          rounds: divRounds,
          status: 'ongoing',
        };
      });

      rounds = finalDivisions[0].rounds;
      finalParticipants = finalDivisions.flatMap((d) => d.participants);
    } else {
      if (participants.length < 2) {
        alert('Vui lòng có ít nhất 2 đội hoặc người chơi tham gia!');
        return;
      }
      if (format === 'single_elimination') {
        rounds = generateSingleElimination(participants, settings);
      } else if (format === 'double_elimination') {
        rounds = generateDoubleElimination(participants, settings);
      } else {
        rounds = generateRoundRobin(participants, settings);
      }
    }

    let newTournament: Tournament = {
      id: initialTournament?.id || `tour-${Date.now()}`,
      name: name.trim() || 'Giải Đấu Esports Discord',
      description: description.trim(),
      game,
      customGameName: game === 'custom' ? customGameName : undefined,
      format: finalDivisions ? finalDivisions[0].format || format : format,
      createdAt: initialTournament?.createdAt || Date.now(),
      updatedAt: Date.now(),
      participants: finalParticipants,
      rounds,
      divisions: finalDivisions,
      activeDivisionId: finalDivisions ? finalDivisions[0].id : undefined,
      settings,
      status: 'ongoing',
    };

    // Auto-generate schedule if enabled
    if (enableAutoSchedule) {
      newTournament = autoGenerateTournamentSchedule(newTournament, {
        startDate,
        startTime,
        matchDurationMinutes: Number(matchDuration),
        bufferTimeMinutes: Number(bufferTime),
        concurrentStreams: Number(concurrentStreams),
        voiceRoomPrefix: '🔊 Voice Bàn',
      });
    }

    onSaveTournament(newTournament);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="tournament-setup-modal"
        className="relative w-full max-w-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {initialTournament ? 'Chỉnh Sửa Cấu Hình Giải Đấu' : 'Tạo Giải Đấu Esports Discord Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Tùy biến luật cấm/chọn, điểm số, 4 mục giải thưởng & Tự động tạo lịch thi đấu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center border-b border-white/10 bg-white/[0.02] px-6 py-2.5 gap-2 sm:gap-4 text-xs font-semibold overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all shrink-0 ${
              step === 1
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>1.</span> Game & Thể thức
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all shrink-0 ${
              step === 2
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>2.</span> {isMultiDivision ? `Bảng Đấu & Đội (${divisions.length} Bảng)` : `Đội thi đấu (${participants.length})`}
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all shrink-0 ${
              step === 3
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>3.</span> Luật Cấm/Chọn & Điểm
          </button>
          <button
            id="tab-setup-prizes"
            onClick={() => setStep(4)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all shrink-0 ${
              step === 4
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>4.</span> Giải Thưởng
          </button>
          <button
            onClick={() => setStep(5)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all shrink-0 ${
              step === 5
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>5.</span> Lịch & Discord
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* STEP 1: Game & Format */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Chọn mẫu Game / Bộ môn Esports:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {GAME_PRESETS.map((preset) => {
                    const isSelected = game === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectGamePreset(preset)}
                        className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between backdrop-blur-md ${
                          isSelected
                            ? 'border-indigo-400/80 bg-indigo-950/50 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20'
                            : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-indigo-300 border border-white/5">
                            {preset.badge}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 mt-2">
                            {preset.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {game === 'custom' && (
                  <div className="mt-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                      🎮 Nhập tên tựa game / bộ môn tùy chỉnh (VD: MULTI-GAME, FC Online, CS2, Dota 2, v.v.):
                    </label>
                    <input
                      type="text"
                      value={customGameName}
                      onChange={(e) => setCustomGameName(e.target.value)}
                      placeholder="VD: MULTI-GAME hoặc FC Online 4..."
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-slate-950"
                    />
                  </div>
                )}
              </div>

              {/* Tournament Name & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tên giải đấu:
                  </label>
                  <input
                    id="input-tournament-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Giải Valorant 5v5 Discord Cup"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Mô tả / Slogan:
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="VD: Giải đấu giao lưu cuối tuần..."
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>

              {/* Format Selection - 2 Primary Types */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Chọn 1 trong 2 dạng trận đấu chính:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DẠNG 1: ĐẤU VÒNG LOẠI */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      format === 'single_elimination' || format === 'double_elimination'
                        ? 'border-indigo-400 bg-gradient-to-b from-indigo-950/60 to-slate-900 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-950/40'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-mono">
                          ⚔️ DẠNG 1: ĐẤU VÒNG LOẠI
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">Knockout Bracket</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                        <Swords className="w-4 h-4 text-indigo-400" /> Phân Nhánh Loại Trực Tiếp
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Phân cặp hạt giống, thi đấu theo sơ đồ nhánh cây (Vòng loại, Tứ kết, Bán kết, Chung kết). Đội thắng đi tiếp để đoạt Cúp Vô Địch.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 block">Chọn kiểu nhánh đấu:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          id="btn-format-single-elim"
                          onClick={() => setFormat('single_elimination')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                            format === 'single_elimination'
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                              : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                          }`}
                        >
                          Loại Trực Tiếp (1 Mạng)
                        </button>
                        <button
                          type="button"
                          id="btn-format-double-elim"
                          onClick={() => setFormat('double_elimination')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                            format === 'double_elimination'
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                              : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                          }`}
                        >
                          Nhánh Thắng/Thua (2 Mạng)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DẠNG 2: DẠNG TÍNH ĐIỂM */}
                  <div
                    onClick={() => setFormat('round_robin')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      format === 'round_robin'
                        ? 'border-emerald-400 bg-gradient-to-b from-emerald-950/60 to-slate-900 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/40'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                          📊 DẠNG 2: DẠNG TÍNH ĐIỂM
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">Points / Round Robin</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" /> Vòng Tròn Bảng Điểm & BXH
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Tất cả các đội thi đấu vòng tròn theo từng lượt trận. Hệ thống tự động tính điểm theo kết quả Thắng (+3đ), Hòa (+1đ), Thua (+0đ) và xếp thứ hạng.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-500/20">
                        <span className="font-semibold">Bảng xếp hạng thời gian thực:</span>
                        <span className="font-bold">Điểm • W-D-L • Hiệu số</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Participants / Divisions */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Bracket Architecture Toggle */}
              <div className="p-3 bg-white/[0.04] rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Cấu trúc bảng đấu giải:
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsMultiDivision(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !isMultiDivision
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>1 Bảng Đấu Duy Nhất</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMultiDivision(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isMultiDivision
                        ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5 text-amber-300" />
                    <span>Nhiều Bảng Đấu / Lưu Phái ({divisions.length} Bảng)</span>
                  </button>
                </div>
              </div>

              {isMultiDivision ? (
                /* MULTI-DIVISION CONFIGURATION */
                <DivisionSetupTab
                  divisions={divisions}
                  onChangeDivisions={setDivisions}
                  defaultFormat={format}
                />
              ) : (
                /* SINGLE BRACKET PARTICIPANTS */
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/[0.04] rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Tổng số: <strong>{participants.length}</strong> Đội / Tuyển thủ</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleShuffleSeeds}
                        className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg flex items-center gap-1 transition-colors border border-white/10"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-indigo-400" /> Xáo trộn
                      </button>

                    </div>
                  </div>

                  {/* Dynamic Roadmap Stage Preview */}
                  {format !== 'round_robin' && (
                    <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 p-3.5 rounded-2xl border border-indigo-500/20 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-400" /> Sơ đồ các giai đoạn ({participants.length} đội/tuyển thủ):
                        </span>
                        <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md">
                          {getRoadmapStages(participants.length).length} Giai đoạn
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-300">
                        {getRoadmapStages(participants.length).map((stg, idx, arr) => (
                          <React.Fragment key={idx}>
                            <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                              stg.color === 'amber'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
                                : stg.color === 'purple'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-500/30 font-bold'
                                : stg.color === 'indigo'
                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {stg.icon} {stg.name}
                            </span>
                            {idx < arr.length - 1 && <span className="text-slate-500 font-bold">➔</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bulk Paste Area */}
                  <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      📋 Dán nhanh danh sách từ Discord (Mỗi dòng 1 đội hoặc Player):
                    </label>
                    <textarea
                      id="textarea-bulk-participants"
                      rows={3}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder={`Sentinels (@sen_captain)\nPaper Rex (@prx_captain)\nFnatic (@fnc_captain)\nTeam Liquid (@tl_cap)`}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      id="btn-apply-bulk-participants"
                      onClick={handleBulkImport}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30"
                    >
                      Áp dụng danh sách dán
                    </button>
                  </div>

                  {/* Add Single Participant */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Tên đội / Player mới..."
                      className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08]"
                    />
                    <input
                      type="text"
                      value={newTeamDiscord}
                      onChange={(e) => setNewTeamDiscord(e.target.value)}
                      placeholder="Discord Tag (VD: @user#1234)..."
                      className="w-full sm:w-48 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08]"
                    />
                    <button
                      type="button"
                      id="btn-add-single-participant"
                      onClick={handleAddParticipant}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1 shrink-0 shadow-md shadow-indigo-600/30"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>

                  {/* Participant List Preview with Drag & Drop */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400" /> Kéo thả thẻ để đổi thứ tự hạt giống (Seed)
                      </span>
                      <span>{participants.length} đội</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-white/5 bg-white/[0.03] rounded-2xl border border-white/10">
                      {participants.map((p, idx) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(idx)}
                          onDragEnd={() => setDraggedIndex(null)}
                          className={`flex items-center justify-between px-3 py-2 text-xs transition-all cursor-grab active:cursor-grabbing ${
                            draggedIndex === idx
                              ? 'opacity-40 bg-indigo-950/60 ring-1 ring-indigo-500'
                              : 'hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <GripVertical className="w-4 h-4 text-slate-500 hover:text-slate-300 shrink-0" />
                            <span className="w-6 h-6 rounded-lg bg-white/10 font-mono text-[11px] font-bold text-slate-300 flex items-center justify-center shrink-0 border border-white/5">
                              #{p.seed}
                            </span>
                            <span className="font-bold text-slate-200 truncate">{p.name}</span>
                            {p.discordTag && (
                              <span className="text-indigo-400 font-mono truncate text-[11px]">
                                {p.discordTag}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Detailed Rules & Scoring Customization */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Draft & Ban Pick Customization */}
              <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  <Shield className="w-4 h-4" /> Quy Tắc Cấm/Chọn Tướng & Chọn Bên (Draft & Side Pick)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Chế độ Cấm/Chọn (Draft Mode):
                    </label>
                    <select
                      value={draftMode}
                      onChange={(e) => setDraftMode(e.target.value as DraftMode)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="tournament_draft">Tournament Draft (5 Ban / 5 Pick)</option>
                      <option value="fearless_draft">Fearless Draft (Cấm lặp lại tướng đã chơi)</option>
                      <option value="quick_3_ban">Quick Draft (3 Ban mỗi bên)</option>
                      <option value="solo_1v1_ban">Solo 1v1 Ban (Cấm 3 tướng)</option>
                      <option value="blind_pick">Blind Pick (Chọn ẩn không ban)</option>
                      <option value="none">Tự do / Không cấm chọn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Số lượt cấm mỗi đội:
                    </label>
                    <select
                      value={bansPerTeam}
                      onChange={(e) => setBansPerTeam(Number(e.target.value))}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value={0}>0 lượt cấm</option>
                      <option value={1}>1 lượt cấm</option>
                      <option value={2}>2 lượt cấm</option>
                      <option value={3}>3 lượt cấm</option>
                      <option value={5}>5 lượt cấm (Chuẩn Esports)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Quy tắc chọn bên (Side Pick):
                    </label>
                    <select
                      value={sideSelection}
                      onChange={(e) => setSideSelection(e.target.value as SideSelectionRule)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="coin_toss">Tung đồng xu (Coin Toss)</option>
                      <option value="higher_seed">Seed cao hơn chọn bên ván 1</option>
                      <option value="loser_picks_next">Đội thua ván trước chọn bên ván sau</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stage Best Of Customization */}
              <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                  <Swords className="w-4 h-4" /> Thể Thức Thi Đấu (Best Of) Cho Từng Vòng
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Vòng ngoài / Vòng Bảng:
                    </label>
                    <select
                      value={defaultBestOf}
                      onChange={(e) => setDefaultBestOf(Number(e.target.value))}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value={1}>BO1 (1 ván)</option>
                      <option value={2}>BO2 (2 ván có hòa)</option>
                      <option value={3}>BO3 (Thắng 2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Vòng Tứ Kết:
                    </label>
                    <select
                      value={quartersBestOf}
                      onChange={(e) => setQuartersBestOf(Number(e.target.value))}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value={1}>BO1 (1 ván)</option>
                      <option value={3}>BO3 (Thắng 2)</option>
                      <option value={5}>BO5 (Thắng 3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Vòng Bán Kết:
                    </label>
                    <select
                      value={semisBestOf}
                      onChange={(e) => setSemisBestOf(Number(e.target.value))}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value={1}>BO1 (1 ván)</option>
                      <option value={3}>BO3 (Thắng 2)</option>
                      <option value={5}>BO5 (Thắng 3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Chung Kết:
                    </label>
                    <select
                      value={finalsBestOf}
                      onChange={(e) => setFinalsBestOf(Number(e.target.value))}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value={1}>BO1 (1 ván)</option>
                      <option value={3}>BO3 (Thắng 2)</option>
                      <option value={5}>BO5 (Thắng 3)</option>
                      <option value={7}>BO7 (Thắng 4)</option>
                    </select>
                  </div>
                </div>

                {format === 'single_elimination' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <input
                      id="checkbox-third-place"
                      type="checkbox"
                      checked={hasThirdPlaceMatch}
                      onChange={(e) => setHasThirdPlaceMatch(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/20 focus:ring-indigo-500"
                    />
                    <label htmlFor="checkbox-third-place" className="text-xs text-slate-200 cursor-pointer">
                      Bao gồm trận <strong>Tranh Hạng 3 (3rd Place Match)</strong>
                    </label>
                  </div>
                )}
              </div>

              {/* Custom Written Rules (Textarea) */}
              <div className="bg-gradient-to-br from-indigo-950/30 via-slate-900 to-purple-950/30 p-4 rounded-2xl border border-indigo-500/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                    <FileText className="w-4 h-4" /> Soạn Thảo Luật Thi Đấu Văn Bản & Quy Định Chi Tiết
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (Xuất tự động vào Discord Announcement & Chi tiết giải)
                  </span>
                </div>

                {/* Quick Templates */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">✨ Mẫu luật nhanh:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setRulesText(
                        '1. Đội tuyển phải có mặt tại Voice Discord trước giờ thi đấu 15 phút.\n2. Thời gian trễ tối đa: 10 phút. Quá giờ tính xử thua (Walkover).\n3. Tôn trọng đối thủ và trọng tài. Quyết định của BTC là quyết định cuối cùng.'
                      )
                    }
                    className="px-2 py-0.5 text-[11px] bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg border border-white/10 transition-colors"
                  >
                    Chuẩn Esports
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRulesText(
                        '1. Điều kiện thắng: Ăn 1 Chiến công đầu (First Blood) HOẶC Phá 1 Trụ đầu HOẶC Đạt 100 Lính.\n2. Cấm vào rừng ăn quái, cấm biến về mua đồ.\n3. Đấu thủ chụp màn hình gửi kênh kết quả sau trận.'
                      )
                    }
                    className="px-2 py-0.5 text-[11px] bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg border border-white/10 transition-colors"
                  >
                    Solo 1v1 Skill
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRulesText(
                        '1. Thi đấu theo sơ đồ 4 vòng (Vòng loại -> Tứ kết -> Bán kết -> Chung kết).\n2. Mỗi đội được 1 lần Pause kỹ thuật tối đa 5 phút.\n3. Chụp màn hình bảng điểm gửi lên kênh Discord để Admin cập nhật.'
                      )
                    }
                    className="px-2 py-0.5 text-[11px] bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg border border-white/10 transition-colors"
                  >
                    Đa Game 4 Vòng
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRulesText(
                        '1. Áp dụng Fearless Draft: Tướng đã chọn ở ván trước cấm sử dụng ở các ván sau.\n2. Đội thua ván trước được quyền chọn bên (Xanh/Đỏ hoặc Tấn Công/Phòng Thủ) ván sau.'
                      )
                    }
                    className="px-2 py-0.5 text-[11px] bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg border border-white/10 transition-colors"
                  >
                    Fearless Draft
                  </button>
                </div>

                <textarea
                  id="input-tournament-rules-text"
                  rows={4}
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  placeholder="Nhập nội dung luật thi đấu, quy định cấm chọn, thể thức tính điểm hoặc điều khoản riêng của giải..."
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-slate-950 transition-all font-mono leading-relaxed resize-y"
                />
              </div>
            </div>
          )}

          {/* STEP 4: TÙY CHỈNH 4 MỤC GIẢI THƯỞNG */}
          {step === 4 && (
            <PrizeSetupTab
              game={game}
              cashEnabled={cashEnabled}
              setCashEnabled={setCashEnabled}
              cashTotal={cashTotal}
              setCashTotal={setCashTotal}
              cashChampion={cashChampion}
              setCashChampion={setCashChampion}
              cashRunnerUp={cashRunnerUp}
              setCashRunnerUp={setCashRunnerUp}
              cashThirdPlace={cashThirdPlace}
              setCashThirdPlace={setCashThirdPlace}
              cashMVP={cashMVP}
              setCashMVP={setCashMVP}
              cashPaymentMethod={cashPaymentMethod}
              setCashPaymentMethod={setCashPaymentMethod}
              inGameEnabled={inGameEnabled}
              setInGameEnabled={setInGameEnabled}
              inGameCurrencyName={inGameCurrencyName}
              setInGameCurrencyName={setInGameCurrencyName}
              inGameTotal={inGameTotal}
              setInGameTotal={setInGameTotal}
              inGameChampion={inGameChampion}
              setInGameChampion={setInGameChampion}
              inGameRunnerUp={inGameRunnerUp}
              setInGameRunnerUp={setInGameRunnerUp}
              inGameThirdPlace={inGameThirdPlace}
              setInGameThirdPlace={setInGameThirdPlace}
              inGameMVP={inGameMVP}
              setInGameMVP={setInGameMVP}
              rolesEnabled={rolesEnabled}
              setRolesEnabled={setRolesEnabled}
              rolesChampion={rolesChampion}
              setRolesChampion={setRolesChampion}
              rolesRunnerUp={rolesRunnerUp}
              setRolesRunnerUp={setRolesRunnerUp}
              rolesThirdPlace={rolesThirdPlace}
              setRolesThirdPlace={setRolesThirdPlace}
              rolesParticipant={rolesParticipant}
              setRolesParticipant={setRolesParticipant}
              rolesMVP={rolesMVP}
              setRolesMVP={setRolesMVP}
              rolesPerks={rolesPerks}
              setRolesPerks={setRolesPerks}
              otherEnabled={otherEnabled}
              setOtherEnabled={setOtherEnabled}
              otherItems={otherItems}
              setOtherItems={setOtherItems}
              sponsorName={sponsorName}
              setSponsorName={setSponsorName}
              customNotes={customPrizeNotes}
              setCustomNotes={setCustomPrizeNotes}
            />
          )}

          {/* STEP 5: Schedule Automation & Discord Info */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Automatic Match Scheduler Settings */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/40 p-4 rounded-2xl border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    <Calendar className="w-4 h-4" /> Tự Động Tạo Lịch Thi Đấu Cho Các Vòng
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAutoSchedule}
                      onChange={(e) => setEnableAutoSchedule(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/20"
                    />
                    <span className="font-semibold text-cyan-200">Kích hoạt xếp lịch ngay</span>
                  </label>
                </div>

                {enableAutoSchedule && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        📅 Ngày bắt đầu:
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        ⏰ Giờ bắt đầu:
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        ⏳ Thời lượng/ván (phút):
                      </label>
                      <select
                        value={matchDuration}
                        onChange={(e) => setMatchDuration(Number(e.target.value))}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                      >
                        <option value={15}>15 phút</option>
                        <option value={25}>25 phút</option>
                        <option value={35}>35 phút</option>
                        <option value={50}>50 phút</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        🎙️ Bàn đấu song song:
                      </label>
                      <select
                        value={concurrentStreams}
                        onChange={(e) => setConcurrentStreams(Number(e.target.value))}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                      >
                        <option value={1}>1 bàn (Tuần tự)</option>
                        <option value={2}>2 bàn song song</option>
                        <option value={4}>4 bàn song song</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Discord Details & Prize Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    🏛️ Tên Discord Server / Community:
                  </label>
                  <input
                    type="text"
                    value={discordServerName}
                    onChange={(e) => setDiscordServerName(e.target.value)}
                    placeholder="VD: Tournament Discord Server Slay"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    💰 Tóm tắt giải thưởng (Prize Pool Summary):
                  </label>
                  <input
                    type="text"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    placeholder="VD: 1.000.000 VNĐ + 11.500 VP + Role 👑"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              {/* Rules Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  📜 Ghi chú luật thi đấu bổ sung (xuất vào Discord Announcement):
                </label>
                <textarea
                  rows={3}
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  placeholder="Ghi chú luật giải..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-t border-white/10">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                ← Quay lại
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Hủy
            </button>

            {step < 5 ? (
              <button
                type="button"
                id="btn-setup-next-step"
                onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                Tiếp tục ➔
              </button>
            ) : (
              <button
                type="button"
                id="btn-finish-create-tournament"
                onClick={handleCreateTournament}
                className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" /> Hoàn Tất & Khởi Tạo Bảng Đấu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
