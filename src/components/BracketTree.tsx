import React, { useRef, useState } from 'react';
import { Tournament, Match, Participant, Round } from '../types/tournament';
import { MatchCard } from './MatchCard';
import { swapBracketMatchSlots } from '../utils/bracketGenerator';
import { toPng } from 'html-to-image';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trophy,
  Award,
  LayoutGrid,
  GitBranch,
  Search,
  CheckCircle2,
  Swords,
  Flame,
  Crown,
  Download,
  Sparkles,
} from 'lucide-react';

interface BracketTreeProps {
  tournament: Tournament;
  isAdmin?: boolean;
  onOpenMatchModal?: (match: Match) => void;
  onSelectMatch?: (match: Match) => void;
  onQuickWinner?: (match: Match, winnerId: string) => void;
  onUpdateTournament?: (updated: Tournament) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({
  tournament,
  isAdmin = false,
  onOpenMatchModal,
  onSelectMatch,
  onQuickWinner,
  onUpdateTournament,
}) => {
  const handleOpenMatchModal = onOpenMatchModal || onSelectMatch || (() => {});
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [displayMode, setDisplayMode] = useState<'grid' | 'tree'>('grid');
  const [selectedRoundId, setSelectedRoundId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportingRoundId, setExportingRoundId] = useState<string | null>(null);

  const handleSwapMatchSlots = (
    sourceMatchId: string,
    sourceSlot: 1 | 2,
    targetMatchId: string,
    targetSlot: 1 | 2
  ) => {
    if (!onUpdateTournament) return;
    const updated = swapBracketMatchSlots(tournament, sourceMatchId, sourceSlot, targetMatchId, targetSlot);
    onUpdateTournament(updated);
  };

  const mainRounds = tournament.rounds.filter(
    (r) => r.bracketSection === 'winners' || r.bracketSection === 'grand_final'
  );
  const thirdPlaceRound = tournament.rounds.find((r) => r.bracketSection === 'third_place');

  const champion = tournament.participants.find((p) => p.id === tournament.championId);
  const runnerUp = tournament.participants.find((p) => p.id === tournament.runnerUpId);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoom(1);

  // Quick download image for specific round
  const handleDownloadRound = async (elementId: string, roundName: string) => {
    const node = document.getElementById(elementId);
    if (!node) {
      alert('Không tìm thấy vùng cần xuất ảnh!');
      return;
    }

    try {
      setExportingRoundId(elementId);
      const dataUrl = await toPng(node, {
        backgroundColor: '#020617',
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${tournament.name.replace(/\s+/g, '_')}_${roundName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting round image:', err);
      alert('Đã xảy ra lỗi khi tạo ảnh vòng đấu.');
    } finally {
      setExportingRoundId(null);
    }
  };

  // Filter matches based on search query
  const filterMatches = (matches: Match[]) => {
    if (!searchQuery.trim()) return matches;
    const q = searchQuery.toLowerCase().trim();
    return matches.filter((m) => {
      const p1 = tournament.participants.find((p) => p.id === m.participant1Id);
      const p2 = tournament.participants.find((p) => p.id === m.participant2Id);
      return (
        p1?.name.toLowerCase().includes(q) ||
        p1?.discordTag?.toLowerCase().includes(q) ||
        p2?.name.toLowerCase().includes(q) ||
        p2?.discordTag?.toLowerCase().includes(q) ||
        m.voiceChannel?.toLowerCase().includes(q) ||
        m.mapPicked?.toLowerCase().includes(q)
      );
    });
  };

  const selectedRound = mainRounds.find((r) => r.id === selectedRoundId);

  // Get total matches count
  const totalMatchesCount = mainRounds.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div className="relative w-full overflow-hidden flex flex-col bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-2xl p-4 sm:p-5 space-y-4">
      {/* Top Header: Title & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-indigo-400" />
            Sơ đồ Bảng Đấu Trực Tiếp ({tournament.participants.length} Đội/Player)
          </span>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
            Single Elimination
          </span>
        </div>

        {/* View Mode Toggle: Grid View vs Tree View */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            id="btn-view-mode-grid"
            onClick={() => setDisplayMode('grid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              displayMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Xem danh sách trận đấu dạng lưới theo từng vòng"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dạng Lưới (Grid)</span>
          </button>

          <button
            id="btn-view-mode-tree"
            onClick={() => setDisplayMode('tree')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              displayMode === 'tree'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Xem sơ đồ cây bảng đấu nối ngang"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sơ Đồ Cây (Tree)</span>
          </button>

          {displayMode === 'tree' && (
            <div className="flex items-center gap-0.5 border-l border-slate-800 ml-1 pl-1 text-slate-300">
              <button
                id="btn-zoom-out"
                onClick={handleZoomOut}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-400">
                {Math.round(zoom * 100)}%
              </span>
              <button
                id="btn-zoom-in"
                onClick={handleZoomIn}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Phóng to"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-zoom-reset"
                onClick={handleResetZoom}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Đặt lại zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Round Selection Buttons (Vòng Loại, Tứ Kết, Bán Kết, Chung Kết...) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Button: Tất cả các vòng */}
          <button
            id="btn-round-tab-all"
            onClick={() => setSelectedRoundId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              selectedRoundId === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span>Tất Cả Các Vòng</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedRoundId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalMatchesCount}
            </span>
          </button>

          {/* Dynamic Round Buttons: Vòng Loại, Tứ Kết, Bán Kết, Chung Kết */}
          {mainRounds.map((round) => {
            const isSelected = selectedRoundId === round.id;
            const isFinishedCount = round.matches.filter((m) => m.status === 'finished').length;
            const isLiveCount = round.matches.filter((m) => m.status === 'live').length;
            const isFinals = round.bracketSection === 'grand_final' || round.matches.length === 1;

            return (
              <button
                key={round.id}
                id={`btn-round-tab-${round.id}`}
                onClick={() => setSelectedRoundId(round.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? isFinals
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                {isFinals ? <Crown className="w-3.5 h-3.5 text-amber-300" /> : null}
                <span>{round.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {round.matches.length} trận
                </span>
                {isLiveCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Có trận đang LIVE" />
                )}
              </button>
            );
          })}

          {/* Button: Vinh Danh Vô Địch */}
          <button
            id="btn-round-tab-podium"
            onClick={() => setSelectedRoundId('podium')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              selectedRoundId === 'podium'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-amber-300 shadow-md shadow-amber-500/30'
                : 'bg-slate-900/90 text-amber-400/90 border-slate-800 hover:border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Vinh Danh Vô Địch</span>
          </button>
        </div>

        {/* Quick search input */}
        <div className="relative min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm đội, player, voice..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div id="tournament-bracket-canvas" className="w-full">
        {isAdmin && onUpdateTournament && (
          <div className="mb-4 flex items-center justify-between gap-2 p-2.5 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Kéo thả đổi cặp đấu:</strong> Bạn có thể dùng chuột giữ và kéo bất kỳ tuyển thủ (hoặc ô <em>Miễn đấu</em>) giữa các Bàn để hoán đổi vị trí trực tiếp!
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30 font-bold">
              👑 Admin Drag & Drop
            </span>
          </div>
        )}

        {displayMode === 'grid' ? (
          /* ========================================================================= */
          /* GRID VIEW MODE (DANH SÁCH DẠNG LƯỚI THEO TỪNG VÒNG ĐẤU)                   */
          /* ========================================================================= */
          <div className="space-y-6 pt-2">
            {/* VIEW SPECIFIC ROUND */}
            {selectedRoundId !== 'all' && selectedRoundId !== 'podium' && selectedRound && (
              <div
                id={`round-grid-section-${selectedRound.id}`}
                className="space-y-4 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/60 animate-in fade-in duration-200"
              >
                {/* Round Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {selectedRound.name}
                    </h3>
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2 py-0.5 rounded-lg font-mono font-semibold">
                      BO{selectedRound.bestOf}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {selectedRound.matches.length} Trận đấu
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <button
                      onClick={() => handleDownloadRound(`round-grid-section-${selectedRound.id}`, selectedRound.name)}
                      disabled={exportingRoundId === `round-grid-section-${selectedRound.id}`}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg flex items-center gap-1 font-semibold text-xs transition-colors"
                      title="Tải riêng ảnh của vòng đấu này"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{exportingRoundId === `round-grid-section-${selectedRound.id}` ? 'Đang tải...' : 'Tải Ảnh Vòng Này'}</span>
                    </button>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedRound.matches.filter((m) => m.status === 'finished').length}/{selectedRound.matches.length} Xong
                    </span>
                    {selectedRound.matches.some((m) => m.status === 'live') && (
                      <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
                        <Flame className="w-3.5 h-3.5" /> LIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Cards Grid */}
                {(() => {
                  const filtered = filterMatches(selectedRound.matches);
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800/60 text-slate-400 text-xs">
                        Không tìm thấy trận đấu nào phù hợp với từ khóa "{searchQuery}"
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtered.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          participants={tournament.participants}
                          isAdmin={isAdmin}
                          onOpenMatchModal={handleOpenMatchModal}
                          onQuickWinner={onQuickWinner}
                          onSwapMatchSlots={isAdmin && onUpdateTournament ? handleSwapMatchSlots : undefined}
                        />
                      ))}
                    </div>
                  );
                })()}

                {/* If Final Round, also render the Champion Podium below */}
                {(selectedRound.bracketSection === 'grand_final' || selectedRound.matches.length === 1) && (
                  <div className="mt-8 pt-6 border-t border-slate-800/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 text-center">
                      🏆 Ngôi Vương Vô Địch & Tranh Hạng 3
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                      {/* Champion Box */}
                      <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30 animate-pulse">
                          <Trophy className="w-7 h-7 text-amber-400" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                          QUÁN QUÂN / CHAMPION
                        </span>
                        <h4 className="text-lg font-black text-white mt-1 mb-0.5">
                          {champion ? champion.name : 'Chưa xác định'}
                        </h4>
                        {champion?.discordTag && (
                          <p className="text-xs text-amber-300/80 font-mono mb-2">{champion.discordTag}</p>
                        )}
                        {runnerUp && (
                          <div className="mt-2 pt-2 border-t border-slate-800 w-full flex items-center justify-center gap-1 text-xs text-slate-400">
                            <Award className="w-3.5 h-3.5 text-slate-300" />
                            <span>Á quân: <strong className="text-slate-200">{runnerUp.name}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* 3rd Place Match Card */}
                      {thirdPlaceRound && thirdPlaceRound.matches.length > 0 && (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                            🥉 Trận Tranh Hạng 3
                          </span>
                          <div className="w-full">
                            <MatchCard
                              match={thirdPlaceRound.matches[0]}
                              participants={tournament.participants}
                              isAdmin={isAdmin}
                              onOpenMatchModal={handleOpenMatchModal}
                              onQuickWinner={onQuickWinner}
                              onSwapMatchSlots={isAdmin && onUpdateTournament ? handleSwapMatchSlots : undefined}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW ALL ROUNDS (GRID SECTIONS) */}
            {selectedRoundId === 'all' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {mainRounds.map((round) => {
                  const filtered = filterMatches(round.matches);
                  if (filtered.length === 0 && searchQuery) return null;

                  return (
                    <div
                      key={round.id}
                      id={`round-grid-section-${round.id}`}
                      className="space-y-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/60"
                    >
                      {/* Round Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/80 px-4 py-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <h4 className="text-sm font-bold text-white tracking-wide">
                            {round.name}
                          </h4>
                          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] px-2 py-0.5 rounded font-mono">
                            BO{round.bestOf}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {round.matches.length} Trận
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-slate-400">
                          <button
                            onClick={() => handleDownloadRound(`round-grid-section-${round.id}`, round.name)}
                            disabled={exportingRoundId === `round-grid-section-${round.id}`}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg flex items-center gap-1 font-semibold text-xs transition-colors"
                            title={`Tải riêng ảnh PNG của ${round.name}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{exportingRoundId === `round-grid-section-${round.id}` ? 'Đang tải...' : 'Tải Ảnh Vòng'}</span>
                          </button>
                          <span>
                            {round.matches.filter((m) => m.status === 'finished').length}/{round.matches.length} Hoàn tất
                          </span>
                        </div>
                      </div>

                      {/* Matches Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((match) => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            participants={tournament.participants}
                            isAdmin={isAdmin}
                            onOpenMatchModal={handleOpenMatchModal}
                            onQuickWinner={onQuickWinner}
                            onSwapMatchSlots={isAdmin && onUpdateTournament ? handleSwapMatchSlots : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Champion Podium Summary at bottom of All Rounds */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30 animate-pulse">
                        <Trophy className="w-7 h-7 text-amber-400" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                        🏆 QUÁN QUÂN CHUNG CUỘC
                      </span>
                      <h4 className="text-lg font-black text-white mt-1 mb-0.5">
                        {champion ? champion.name : 'Chờ trận chung kết'}
                      </h4>
                      {champion?.discordTag && (
                        <p className="text-xs text-amber-300/80 font-mono mb-2">{champion.discordTag}</p>
                      )}
                      {runnerUp && (
                        <div className="mt-2 pt-2 border-t border-slate-800 w-full flex items-center justify-center gap-1 text-xs text-slate-400">
                          <Award className="w-3.5 h-3.5 text-slate-300" />
                          <span>Á quân: <strong className="text-slate-200">{runnerUp.name}</strong></span>
                        </div>
                      )}
                    </div>

                    {thirdPlaceRound && thirdPlaceRound.matches.length > 0 && (
                      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                          🥉 Trận Tranh Hạng 3
                        </span>
                        <div className="w-full">
                          <MatchCard
                            match={thirdPlaceRound.matches[0]}
                            participants={tournament.participants}
                            isAdmin={isAdmin}
                            onOpenMatchModal={handleOpenMatchModal}
                            onQuickWinner={onQuickWinner}
                            onSwapMatchSlots={isAdmin && onUpdateTournament ? handleSwapMatchSlots : undefined}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW PODIUM TAB */}
            {selectedRoundId === 'podium' && (
              <div className="py-6 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
                <div className="bg-gradient-to-b from-amber-500/25 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-8 shadow-2xl shadow-amber-500/10 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/40 animate-pulse">
                    <Trophy className="w-10 h-10 text-amber-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                    👑 NGÔI VƯƠNG VÔ ĐỊCH
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-1">
                    {champion ? champion.name : 'Chưa xác định'}
                  </h3>
                  {champion?.discordTag && (
                    <p className="text-sm text-amber-300 font-mono mb-3">{champion.discordTag}</p>
                  )}
                  {tournament.settings.prizePool && (
                    <div className="mt-2 text-xs bg-amber-950/80 text-amber-200 border border-amber-700/60 px-3 py-1.5 rounded-xl font-bold">
                      💰 Giải Thưởng: {tournament.settings.prizePool}
                    </div>
                  )}

                  {runnerUp && (
                    <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-center gap-2 text-sm text-slate-300">
                      <Award className="w-4 h-4 text-slate-300" />
                      <span>Á Quân (Hạng 2): <strong className="text-white">{runnerUp.name}</strong></span>
                    </div>
                  )}
                </div>

                {thirdPlaceRound && thirdPlaceRound.matches.length > 0 && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                      🥉 Trận Tranh Hạng 3
                    </span>
                    <div className="w-full max-w-sm">
                      <MatchCard
                        match={thirdPlaceRound.matches[0]}
                        participants={tournament.participants}
                        isAdmin={isAdmin}
                        onOpenMatchModal={handleOpenMatchModal}
                        onQuickWinner={onQuickWinner}
                        onSwapMatchSlots={isAdmin && onUpdateTournament ? handleSwapMatchSlots : undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* CLASSIC TREE VIEW MODE (SƠ ĐỒ CÂY NỐI NGANG CÓ ZOOM)                       */
          /* ========================================================================= */
          <div className="overflow-x-auto overflow-y-auto pb-8 pt-4 custom-scrollbar min-h-[480px]">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                transition: 'transform 0.15s ease-out',
              }}
              className="inline-flex gap-8 md:gap-14 px-4 py-2 min-w-max items-start"
            >
              {mainRounds.map((round) => {
                const matchesCount = round.matches.length;
                return (
                  <div key={round.id} className="flex flex-col items-center min-w-[270px]">
                    {/* Round Title Header */}
                    <div className="mb-4 text-center">
                      <span className="inline-block bg-slate-900 border border-slate-700/80 px-3 py-1 rounded-lg text-xs font-bold text-indigo-300 tracking-wide shadow-sm">
                        {round.name}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {matchesCount} Trận đấu • BO{round.bestOf}
                      </p>
                    </div>

                    {/* Round Matches List */}
                    <div className="flex flex-col h-full justify-around space-y-6 pt-2 w-full">
                      {round.matches.map((match) => (
                        <div key={match.id} className="relative group my-auto">
                          <MatchCard
                            match={match}
                            participants={tournament.participants}
                            isAdmin={isAdmin}
                            onOpenMatchModal={handleOpenMatchModal}
                            onQuickWinner={onQuickWinner}
                            onSwapMatchSlots={isAdmin && onUpdateTournament ? handleSwapMatchSlots : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Champion Podium Box Column in Tree */}
              <div className="flex flex-col items-center min-w-[270px] pl-2 pr-2">
                <div className="mb-4 text-center">
                  <span className="inline-block bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1 rounded-lg text-xs font-bold text-amber-300 tracking-wide shadow-sm">
                    🏆 Vinh Danh Vô Địch
                  </span>
                  <p className="text-[11px] text-amber-500/70 mt-1">
                    Ngôi Vương & Tranh Hạng 3
                  </p>
                </div>

                <div className="flex flex-col space-y-6 pt-2 w-full items-center">
                  <div className="w-full bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl shadow-amber-500/10 text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30 animate-pulse">
                      <Trophy className="w-7 h-7 text-amber-400" />
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                      CHAMPION / QUÁN QUÂN
                    </span>

                    <h4 className="text-base font-extrabold text-white mt-1 mb-0.5 truncate max-w-[200px]">
                      {champion ? champion.name : 'Chưa xác định'}
                    </h4>

                    {champion?.discordTag && (
                      <p className="text-xs text-amber-300/80 font-mono mb-2">
                        {champion.discordTag}
                      </p>
                    )}

                    {runnerUp && (
                      <div className="mt-3 pt-2 border-t border-slate-800 w-full flex items-center justify-center gap-1 text-[11px] text-slate-400">
                        <Award className="w-3.5 h-3.5 text-slate-300" />
                        <span>Á quân: <strong>{runnerUp.name}</strong></span>
                      </div>
                    )}

                    {tournament.settings.prizePool && (
                      <div className="mt-2 text-[10px] bg-amber-950/60 text-amber-200 border border-amber-800/60 px-2 py-1 rounded">
                        💰 {tournament.settings.prizePool}
                      </div>
                    )}
                  </div>

                  {thirdPlaceRound && thirdPlaceRound.matches.length > 0 && (
                    <div className="w-full text-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2 inline-block">
                        Trận Tranh Hạng 3
                      </span>
                      <MatchCard
                        match={thirdPlaceRound.matches[0]}
                        participants={tournament.participants}
                        isAdmin={isAdmin}
                        onOpenMatchModal={handleOpenMatchModal}
                        onQuickWinner={onQuickWinner}
                        onSwapMatchSlots={isAdmin && onUpdateTournament ? handleSwapMatchSlots : undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

