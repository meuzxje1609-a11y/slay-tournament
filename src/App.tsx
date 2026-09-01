import React, { useState, useEffect } from 'react';
import { Tournament, Match, Participant, TournamentDivision, getFormatDisplayLabel, getTournamentArchetype } from './types/tournament';
import {
  loadTournaments,
  saveTournaments,
  getActiveTournamentId,
  setActiveTournamentId,
  createDefaultTournament,
  exportTournamentsToJSON,
  importTournamentsFromJSON,
  getAdminAuthState,
  setAdminAuthState,
  fetchTournamentsFromAPI,
  syncTournamentsToAPI,
  fetchMastersFromAPI,
  syncMastersToAPI,
} from './utils/storage';
import { advanceMatchWinner, generateRoundsForDivision } from './utils/bracketGenerator';
import { GAME_PRESETS } from './data/presets';

import { Navbar } from './components/Navbar';
import { BracketTree } from './components/BracketTree';
import { DoubleEliminationView } from './components/DoubleEliminationView';
import { RoundRobinView } from './components/RoundRobinView';
import { MatchModal } from './components/MatchModal';
import { TournamentSetupModal } from './components/TournamentSetupModal';
import { DiscordExportModal } from './components/DiscordExportModal';
import { CoinTossModal } from './components/CoinTossModal';
import { ChampionModal } from './components/ChampionModal';
import { RosterManagerModal } from './components/RosterManagerModal';
import { ScheduleManagerModal } from './components/ScheduleManagerModal';
import { LoginModal } from './components/LoginModal';
import { TournamentsHubModal } from './components/TournamentsHubModal';
import { ThatTuyetBangWidget } from './components/ThatTuyetBangWidget';
import { ThatTuyetBangModal } from './components/ThatTuyetBangModal';
import { DivisionSwitcherBar } from './components/DivisionSwitcherBar';
import { ThatTuyetMaster, DEFAULT_THAT_TUYET_MASTERS } from './types/thatTuyetBang';

import {
  Swords,
  Trophy,
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  Shield,
  Flame,
  CheckCircle2,
  FileCode,
  UploadCloud,
  DownloadCloud,
  Lock,
  Unlock,
  LogOut,
  LayoutGrid,
  Eye,
  Plus,
  Award,
  FileText,
} from 'lucide-react';

export default function App() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournamentId, setActiveId] = useState<string>('');
  const [activeView, setActiveView] = useState<'bracket' | 'matches' | 'rules'>('bracket');

  // Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isTournamentsHubOpen, setIsTournamentsHubOpen] = useState<boolean>(false);

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false);
  const [isCoinTossOpen, setIsCoinTossOpen] = useState<boolean>(false);
  const [isRosterManagerOpen, setIsRosterManagerOpen] = useState<boolean>(false);
  const [isChampionModalOpen, setIsChampionModalOpen] = useState<boolean>(false);
  const [isThatTuyetModalOpen, setIsThatTuyetModalOpen] = useState<boolean>(false);

  // That Tuyet Bang Masters (7 Sects Top 1 in Nghich Thuy Han)
  const [thatTuyetMasters, setThatTuyetMasters] = useState<ThatTuyetMaster[]>(() => {
    try {
      const saved = localStorage.getItem('esports_that_tuyet_masters');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_THAT_TUYET_MASTERS;
  });

  const handleUpdateThatTuyetMasters = (newMasters: ThatTuyetMaster[]) => {
    setThatTuyetMasters(newMasters);
    try {
      localStorage.setItem('esports_that_tuyet_masters', JSON.stringify(newMasters));
    } catch (e) {
      console.error(e);
    }
    syncMastersToAPI(newMasters);
  };

  // Initialize from LocalStorage & Sync from Render API / Firebase Cloud DB
  useEffect(() => {
    const list = loadTournaments();
    setTournaments(list);
    const savedActiveId = getActiveTournamentId();
    const current = list.find((t) => t.id === savedActiveId) || list[0] || createDefaultTournament();
    setActiveId(current.id);

    // Load auth status
    const authState = getAdminAuthState();
    setIsAdmin(authState);

    // Fetch initial fresh data from API
    fetchTournamentsFromAPI().then((apiList) => {
      if (apiList && apiList.length > 0) {
        setTournaments(apiList);
      }
    });

    fetchMastersFromAPI().then((apiMasters) => {
      if (apiMasters && apiMasters.length > 0) {
        setThatTuyetMasters(apiMasters);
      }
    });

    // Auto-polling interval (every 10s) for live viewer real-time synchronization
    const intervalId = setInterval(() => {
      fetchTournamentsFromAPI().then((apiList) => {
        if (apiList && apiList.length > 0) {
          setTournaments(apiList);
        }
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const activeTournament = tournaments.find((t) => t.id === activeTournamentId) || tournaments[0];

  // Auth Handlers
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setAdminAuthState(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminAuthState(false);
  };

  // Helper to persist updates locally and sync to API Server / Firebase DB
  const updateTournament = (updated: Tournament) => {
    const updatedList = tournaments.map((t) => (t.id === updated.id ? updated : t));
    setTournaments(updatedList);
    saveTournaments(updatedList);
    syncTournamentsToAPI(updatedList);

    // If champion was just crowned, trigger celebration
    if (updated.championId && (!activeTournament?.championId || activeTournament.championId !== updated.championId)) {
      setIsChampionModalOpen(true);
    }
  };


  const handleSelectTournament = (id: string) => {
    setActiveId(id);
    setActiveTournamentId(id);
  };

  const handleSaveNewTournament = (newT: Tournament) => {
    const updatedList = [newT, ...tournaments.filter((t) => t.id !== newT.id)];
    setTournaments(updatedList);
    saveTournaments(updatedList);
    syncTournamentsToAPI(updatedList);
    setActiveId(newT.id);
    setActiveTournamentId(newT.id);
  };

  const handleDeleteTournament = (id: string) => {
    if (tournaments.length <= 1) {
      alert('Phải giữ lại ít nhất 1 giải đấu trong hệ thống!');
      return;
    }
    const filtered = tournaments.filter((t) => t.id !== id);
    setTournaments(filtered);
    saveTournaments(filtered);
    syncTournamentsToAPI(filtered);
    if (activeTournamentId === id) {
      setActiveId(filtered[0].id);
      setActiveTournamentId(filtered[0].id);
    }
  };


  // Match score submission
  const handleSaveMatchResults = (
    matchId: string,
    winnerId: string,
    score1: number,
    score2: number,
    details: {
      status: Match['status'];
      voiceChannel?: string;
      mapPicked?: string;
      mvp?: string;
      notes?: string;
      streamUrl?: string;
      scheduledTime?: string;
    }
  ) => {
    if (!activeTournament) return;

    let updated = advanceMatchWinner(
      activeTournament,
      matchId,
      winnerId,
      score1,
      score2,
      details.mapPicked,
      details.mvp
    );

    // Apply supplementary match metadata
    const mapMatches = (matches: Match[]) =>
      matches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            status: details.status,
            voiceChannel: details.voiceChannel || m.voiceChannel,
            mapPicked: details.mapPicked || m.mapPicked,
            mvp: details.mvp || m.mvp,
            notes: details.notes || m.notes,
            streamUrl: details.streamUrl || m.streamUrl,
            scheduledTime: details.scheduledTime || m.scheduledTime,
          };
        }
        return m;
      });

    updated = {
      ...updated,
      rounds: updated.rounds.map((r) => ({
        ...r,
        matches: mapMatches(r.matches),
      })),
      divisions: updated.divisions
        ? updated.divisions.map((d) => ({
            ...d,
            rounds: d.rounds.map((r) => ({
              ...r,
              matches: mapMatches(r.matches),
            })),
          }))
        : undefined,
    };

    updateTournament(updated);
  };

  const handleUpdateParticipants = (updatedParticipants: Participant[]) => {
    if (!activeTournament) return;
    const updated = {
      ...activeTournament,
      participants: updatedParticipants,
      updatedAt: Date.now(),
    };
    updateTournament(updated);
  };

  // JSON Export / Import
  const handleExportJSON = () => {
    const jsonStr = exportTournamentsToJSON(tournaments);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Discord_Esports_Tournaments_Backup_${Date.now()}.json`;
    a.click();
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const imported = importTournamentsFromJSON(text);
        if (imported) {
          setTournaments(imported);
          saveTournaments(imported);
          setActiveId(imported[0].id);
          setActiveTournamentId(imported[0].id);
          alert(`Đã nhập thành công ${imported.length} giải đấu!`);
        } else {
          alert('Tệp JSON không hợp lệ!');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (!activeTournament) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-4">
        <div className="text-center space-y-4">
          <Trophy className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold">Đang khởi tạo giải đấu Esports...</h2>
        </div>
      </div>
    );
  }

  // Multi-Division Handling
  const hasDivisions = Boolean(activeTournament.divisions && activeTournament.divisions.length > 0);
  const activeDivision = hasDivisions
    ? activeTournament.divisions!.find((d) => d.id === activeTournament.activeDivisionId) || activeTournament.divisions![0]
    : null;

  const handleSelectDivision = (divisionId: string) => {
    const targetDiv = activeTournament.divisions?.find((d) => d.id === divisionId);
    if (!targetDiv) return;
    const updated: Tournament = {
      ...activeTournament,
      activeDivisionId: divisionId,
      rounds: targetDiv.rounds,
      format: targetDiv.format || activeTournament.format,
      participants: targetDiv.participants,
    };
    updateTournament(updated);
  };

  const handleAddDivision = (newDivData: Partial<TournamentDivision>) => {
    const defaultParticipants: Participant[] = [
      { id: `p-${Date.now()}-1`, name: 'Người chơi 1', seed: 1 },
      { id: `p-${Date.now()}-2`, name: 'Người chơi 2', seed: 2 },
    ];
    const newDivFormat = newDivData.format || activeTournament.format || 'single_elimination';
    const participants =
      newDivData.participants && newDivData.participants.length >= 2
        ? newDivData.participants
        : defaultParticipants;
    const rounds = generateRoundsForDivision(participants, newDivFormat, activeTournament.settings);

    const newDivision: TournamentDivision = {
      id: `div-${Date.now()}`,
      name: newDivData.name || `Bảng Đấu Mới`,
      sectKey: newDivData.sectKey,
      sectIcon: newDivData.sectIcon || '⚔️',
      format: newDivFormat,
      participants,
      rounds,
      status: 'ongoing',
    };

    const currentDivisions = activeTournament.divisions || [];
    const updatedDivisions = [...currentDivisions, newDivision];
    const updated: Tournament = {
      ...activeTournament,
      divisions: updatedDivisions,
      activeDivisionId: newDivision.id,
      rounds: newDivision.rounds,
    };
    updateTournament(updated);
  };

  const handleEditDivision = (divisionId: string, updatedFields: Partial<TournamentDivision>) => {
    if (!activeTournament.divisions) return;
    const updatedDivisions = activeTournament.divisions.map((d) => {
      if (d.id === divisionId) {
        const updatedDiv = { ...d, ...updatedFields };
        if (updatedFields.participants || updatedFields.format) {
          const divFormat = updatedDiv.format || activeTournament.format;
          updatedDiv.rounds = generateRoundsForDivision(
            updatedDiv.participants,
            divFormat,
            activeTournament.settings
          );
        }
        return updatedDiv;
      }
      return d;
    });

    const activeDivObj = updatedDivisions.find(
      (d) => d.id === (activeTournament.activeDivisionId || divisionId)
    );

    const updated: Tournament = {
      ...activeTournament,
      divisions: updatedDivisions,
      rounds: activeDivObj ? activeDivObj.rounds : activeTournament.rounds,
    };
    updateTournament(updated);
  };

  const handleDeleteDivision = (divisionId: string) => {
    if (!activeTournament.divisions || activeTournament.divisions.length <= 1) {
      alert('Giải đấu phải có ít nhất 1 bảng đấu!');
      return;
    }
    const filtered = activeTournament.divisions.filter((d) => d.id !== divisionId);
    const nextActiveId = filtered[0].id;
    const nextActiveDiv = filtered[0];

    const updated: Tournament = {
      ...activeTournament,
      divisions: filtered,
      activeDivisionId: nextActiveId,
      rounds: nextActiveDiv.rounds,
      format: nextActiveDiv.format || activeTournament.format,
      participants: nextActiveDiv.participants,
    };
    updateTournament(updated);
  };

  // Derive current view tournament for brackets & matches
  const currentViewTournament: Tournament = activeDivision
    ? {
        ...activeTournament,
        name: `${activeTournament.name} • ${activeDivision.name}`,
        format: activeDivision.format || activeTournament.format,
        rounds: activeDivision.rounds,
        participants: activeDivision.participants,
        championId: activeDivision.championId,
        runnerUpId: activeDivision.runnerUpId,
        thirdPlaceId: activeDivision.thirdPlaceId,
        status: activeDivision.status || activeTournament.status,
      }
    : activeTournament;

  // Quick stats
  let totalMatches = 0;
  let finishedMatches = 0;
  let liveMatches = 0;

  const roundsToCount = hasDivisions
    ? activeTournament.divisions!.flatMap((d) => d.rounds)
    : activeTournament.rounds;

  roundsToCount.forEach((r) => {
    r.matches.forEach((m) => {
      totalMatches++;
      if (m.status === 'finished') finishedMatches++;
      if (m.status === 'in_progress' || (m.status as any) === 'live') liveMatches++;
    });
  });

  const gamePreset = GAME_PRESETS.find((g) => g.id === activeTournament.game);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar with Auth & Hub triggers */}
      <Navbar
        tournament={activeTournament}
        tournamentsList={tournaments}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenTournamentsHub={() => setIsTournamentsHubOpen(true)}
        onSelectTournament={handleSelectTournament}
        onOpenNewTournamentModal={() => {
          if (!isAdmin) {
            setIsLoginModalOpen(true);
            return;
          }
          setIsEditMode(false);
          setIsSetupModalOpen(true);
        }}
        onOpenEditTournamentModal={() => {
          if (!isAdmin) {
            setIsLoginModalOpen(true);
            return;
          }
          setIsEditMode(true);
          setIsSetupModalOpen(true);
        }}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        onOpenDiscordExport={() => setIsDiscordModalOpen(true)}
        onOpenCoinToss={() => setIsCoinTossOpen(true)}
        onOpenRosterManager={() => setIsRosterManagerOpen(true)}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />

      {/* Guest Mode Notice Bar */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-950 border-b border-indigo-500/20 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-indigo-200">
              <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Chế độ Người Xem:</strong> Bạn có thể theo dõi trực tiếp bảng đấu, lịch thi đấu và thông tin giải.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTournamentsHubOpen(true)}
                className="text-indigo-300 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Khám phá các giải khác ({tournaments.length})
              </button>
              <span className="text-slate-600">•</span>
              <button
                id="btn-guest-bar-login"
                onClick={() => setIsLoginModalOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> Đăng nhập Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tournament Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
            {/* Left Column: Tournament Details & Action Buttons */}
            <div className="space-y-3.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeTournament.customGameName || gamePreset?.name || 'Multi-Esports Tournament'}
                </span>

                {(() => {
                  const formatInfo = getFormatDisplayLabel(activeTournament.format);
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 font-mono ${formatInfo.badgeColor}`}>
                      <span>{formatInfo.emoji}</span>
                      <span>{formatInfo.archetypeLabel}: {formatInfo.subLabel}</span>
                    </span>
                  );
                })()}

                {liveMatches > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> {liveMatches} Trận đang LIVE
                  </span>
                )}
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                    👑 Quản trị viên
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/80 flex items-center gap-1">
                    👁️ Khách xem
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeTournament.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <strong>{activeTournament.participants.length}</strong> Đội / Player
                </span>
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  Tiến độ: <strong>{finishedMatches}/{totalMatches}</strong> trận
                </span>
                {activeTournament.settings.scheduleConfig?.startDate && (
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeTournament.settings.scheduleConfig.startDate} {activeTournament.settings.scheduleConfig.startTime}
                  </span>
                )}
                {activeTournament.settings.prizePool && (
                  <span className="flex items-center gap-1 text-amber-300">
                    💰 {activeTournament.settings.prizePool}
                  </span>
                )}
                {activeTournament.settings.discordServerName && (
                  <span className="flex items-center gap-1 text-[#5865F2]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {activeTournament.settings.discordServerName}
                  </span>
                )}
              </div>

              {/* Quick Actions CTA */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap pt-1">
                <button
                  id="btn-hero-tournaments-hub"
                  onClick={() => setIsTournamentsHubOpen(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                  <span>Danh Sách Giải ({tournaments.length})</span>
                </button>

                <button
                  id="btn-hero-schedule-manager"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Lịch Thi Đấu</span>
                </button>

                <button
                  id="btn-hero-export-discord"
                  onClick={() => setIsDiscordModalOpen(true)}
                  className="px-3.5 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#5865F2]/25 flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Xuất Cho Discord</span>
                </button>
              </div>
            </div>

            {/* Right Column: Ô "THẤT TUYỆT BẢNG" VINH DANH 7 NGƯỜI TOP 1 Ở 7 LƯU PHÁI NGHỊCH THỦY HÀN */}
            <div className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-end">
              <ThatTuyetBangWidget
                masters={thatTuyetMasters}
                onUpdateMasters={handleUpdateThatTuyetMasters}
                onOpenModal={() => setIsThatTuyetModalOpen(true)}
                onQuickExportDiscord={() => setIsThatTuyetModalOpen(true)}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        </div>

        {/* Multi-Division Switcher Bar (Nhiều Bảng Đấu / Tỉ Võ Lưu Phái) */}
        {hasDivisions && activeTournament.divisions && (
          <DivisionSwitcherBar
            divisions={activeTournament.divisions}
            activeDivisionId={activeTournament.activeDivisionId || activeTournament.divisions[0]?.id}
            onSelectDivision={handleSelectDivision}
            onAddDivision={handleAddDivision}
            onEditDivision={handleEditDivision}
            onDeleteDivision={handleDeleteDivision}
            isAdmin={isAdmin}
          />
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              id="tab-view-bracket"
              onClick={() => setActiveView('bracket')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeView === 'bracket'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {currentViewTournament.format === 'round_robin' ? (
                <>
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Bảng Điểm & Xếp Hạng (Points Leaderboard)</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 text-indigo-400" />
                  <span>Sơ Đồ Bảng Đấu {activeDivision ? `(${activeDivision.name})` : '(Knockout Bracket)'}</span>
                </>
              )}
            </button>
            <button
              id="tab-view-rules"
              onClick={() => setActiveView('rules')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeView === 'rules'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" /> Luật & Thể Thức Thi Đấu
            </button>
          </div>

          {/* Backup / Restore buttons */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1 transition-colors"
              title="Lưu file JSON lưu trữ"
            >
              <DownloadCloud className="w-3.5 h-3.5" /> Xuất JSON
            </button>
            {isAdmin && (
              <button
                onClick={handleImportJSON}
                className="px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1 transition-colors"
                title="Khôi phục dữ liệu từ JSON"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Nhập JSON
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Views */}
        {activeView === 'bracket' && (
          <div className="space-y-6">
            {currentViewTournament.format === 'double_elimination' ? (
              <DoubleEliminationView
                tournament={currentViewTournament}
                onSelectMatch={(m) => setSelectedMatch(m)}
              />
            ) : currentViewTournament.format === 'round_robin' ? (
              <RoundRobinView
                tournament={currentViewTournament}
                onSelectMatch={(m) => setSelectedMatch(m)}
              />
            ) : (
              <BracketTree
                tournament={currentViewTournament}
                onSelectMatch={(m) => setSelectedMatch(m)}
              />
            )}
          </div>
        )}

        {activeView === 'rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Rules summary Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> Luật Thi Đấu & Cấm Chọn (Ban/Pick)
              </h3>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Dạng trận đấu:</span>
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                    {(() => {
                      const f = getFormatDisplayLabel(activeTournament.format);
                      return `${f.emoji} ${f.archetypeLabel} (${f.subLabel})`;
                    })()}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Quy chuẩn ván đấu:</span>
                  <span className="font-bold text-amber-400">
                    Vòng ngoài: BO{activeTournament.settings.defaultBestOf || 1} • Tứ kết: BO{activeTournament.settings.quartersBestOf || 3} • Bán kết: BO{activeTournament.settings.semisBestOf || 3} • Chung kết: BO{activeTournament.settings.finalsBestOf || 5}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Cấm/Chọn & Chọn Bên:</span>
                  <span className="font-bold text-cyan-400">
                    {activeTournament.settings.rulesConfig?.draftMode === 'fearless_draft'
                      ? 'Fearless Draft'
                      : activeTournament.settings.rulesConfig?.draftMode === 'quick_3_ban'
                      ? '3 Ban'
                      : activeTournament.settings.rulesConfig?.draftMode === 'tournament_draft'
                      ? '5 Ban Tournament'
                      : 'Chuẩn'} • {activeTournament.settings.rulesConfig?.bansPerTeam ?? 5} Ban/Đội
                  </span>
                </div>

                {activeTournament.format === 'round_robin' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Quy tắc tính điểm BXH:</span>
                    <span className="font-bold text-emerald-400">
                      Thắng: +{activeTournament.settings.rulesConfig?.winPoints ?? 3}đ • Hòa: +{activeTournament.settings.rulesConfig?.drawPoints ?? 1}đ • Thua: +{activeTournament.settings.rulesConfig?.lossPoints ?? 0}đ
                    </span>
                  </div>
                )}

                {activeTournament.settings.rulesText && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <FileText className="w-4 h-4" /> Luật Thi Đấu Văn Bản & Quy Định Chi Tiết:
                    </div>
                    <p className="text-slate-300 whitespace-pre-line text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-white/5 leading-relaxed">
                      {activeTournament.settings.rulesText}
                    </p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setIsSetupModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  Chỉnh Sửa Luật & Thể Thức Này
                </button>
              )}
            </div>

            {/* Quick guide for Discord mods */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Hướng Dẫn Vận Hành Giải Đấu Discord
              </h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bước 1:</strong> Bấm <strong>"Lịch Đấu"</strong> để tự động chia giờ và phòng Voice cho từng cặp đấu.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bước 2:</strong> Bấm <strong>"Xuất Discord"</strong> để copy lịch hoặc bảng điểm Markdown gửi thẳng vào kênh thông báo Discord.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bước 3:</strong> Click vào bất kỳ cặp đấu nào để nhập kết quả tỉ số, hệ thống sẽ <strong>tự động đẩy người thắng</strong> vào vòng sau.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bước 4:</strong> Bấm <strong>"Tải Ảnh"</strong> để lấy file ảnh sơ đồ chất lượng cao gửi trực tiếp vào server Discord.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-800/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SLAY TOURNAMENT • Nền Tảng Quản Lý Giải Đấu & Sơ Đồ Esports Đa Game Cho Discord</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsTournamentsHubOpen(true)} className="hover:text-white transition-colors">
              Tất Cả Giải Đấu
            </button>
            <button onClick={() => setIsScheduleModalOpen(true)} className="hover:text-white transition-colors">
              Lịch Đấu
            </button>
            <button onClick={() => setIsDiscordModalOpen(true)} className="hover:text-white transition-colors">
              Discord Markdown
            </button>
            <button onClick={() => setIsCoinTossOpen(true)} className="hover:text-white transition-colors">
              Coin Toss / Veto
            </button>
            {isAdmin ? (
              <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                Đăng Xuất Admin
              </button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                Đăng Nhập Admin
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Tournaments Hub Modal (Public & Admin) */}
      {isTournamentsHubOpen && (
        <TournamentsHubModal
          tournaments={tournaments}
          activeTournamentId={activeTournamentId}
          isAdmin={isAdmin}
          onSelectTournament={(id) => {
            handleSelectTournament(id);
            setIsTournamentsHubOpen(false);
          }}
          onOpenNewTournament={() => {
            if (!isAdmin) {
              setIsLoginModalOpen(true);
              return;
            }
            setIsEditMode(false);
            setIsSetupModalOpen(true);
          }}
          onDeleteTournament={handleDeleteTournament}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onClose={() => setIsTournamentsHubOpen(false)}
        />
      )}

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Match Score & Controller Modal */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          tournament={currentViewTournament}
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onClose={() => setSelectedMatch(null)}
          onSaveMatch={handleSaveMatchResults}
        />
      )}

      {/* Tournament Setup & Edit Modal (Admin only) */}
      {isSetupModalOpen && (
        <TournamentSetupModal
          initialTournament={isEditMode ? activeTournament : null}
          onClose={() => setIsSetupModalOpen(false)}
          onSaveTournament={handleSaveNewTournament}
        />
      )}

      {/* Schedule Manager Modal */}
      {isScheduleModalOpen && (
        <ScheduleManagerModal
          tournament={currentViewTournament}
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onClose={() => setIsScheduleModalOpen(false)}
          onUpdateTournament={updateTournament}
          onOpenDiscordExport={() => {
            setIsScheduleModalOpen(false);
            setIsDiscordModalOpen(true);
          }}
        />
      )}

      {/* Discord Markdown Export Modal */}
      {isDiscordModalOpen && (
        <DiscordExportModal
          tournament={currentViewTournament}
          onClose={() => setIsDiscordModalOpen(false)}
        />
      )}

      {/* Coin Toss & Map Veto Tool */}
      {isCoinTossOpen && (
        <CoinTossModal
          tournament={currentViewTournament}
          onClose={() => setIsCoinTossOpen(false)}
        />
      )}

      {/* Roster & Discord Tags Manager Modal */}
      {isRosterManagerOpen && (
        <RosterManagerModal
          tournament={currentViewTournament}
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onClose={() => setIsRosterManagerOpen(false)}
          onUpdateParticipants={handleUpdateParticipants}
        />
      )}

      {/* Champion Victory Modal */}
      {isChampionModalOpen && (
        <ChampionModal
          tournament={currentViewTournament}
          onClose={() => setIsChampionModalOpen(false)}
          onOpenDiscordExport={() => setIsDiscordModalOpen(true)}
        />
      )}

      {/* THẤT TUYỆT BẢNG Modal (7 Lưu Phái Nghịch Thủy Hàn Solo 1v1) */}
      {isThatTuyetModalOpen && (
        <ThatTuyetBangModal
          isOpen={isThatTuyetModalOpen}
          onClose={() => setIsThatTuyetModalOpen(false)}
          masters={thatTuyetMasters}
          onUpdateMasters={handleUpdateThatTuyetMasters}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
