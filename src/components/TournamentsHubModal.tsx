import React, { useState } from 'react';
import { Tournament, getTournamentArchetype, getFormatDisplayLabel } from '../types/tournament';
import { GAME_PRESETS } from '../data/presets';
import {
  Trophy,
  Swords,
  Calendar,
  Users,
  Search,
  Plus,
  PlayCircle,
  CheckCircle2,
  Lock,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Trash2,
  CircleDollarSign,
  Award,
} from 'lucide-react';

interface TournamentsHubModalProps {
  tournaments: Tournament[];
  activeTournamentId: string;
  isAdmin: boolean;
  onSelectTournament: (id: string) => void;
  onOpenNewTournamentModal: () => void;
  onDeleteTournament?: (id: string) => void;
  onOpenLogin: () => void;
  onClose: () => void;
}

export const TournamentsHubModal: React.FC<TournamentsHubModalProps> = ({
  tournaments,
  activeTournamentId,
  isAdmin,
  onSelectTournament,
  onOpenNewTournamentModal,
  onDeleteTournament,
  onOpenLogin,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'finished'>('all');
  const [filterArchetype, setFilterArchetype] = useState<'all' | 'elimination' | 'points'>('all');
  const [filterGame, setFilterGame] = useState<string>('all');

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.game.toLowerCase().includes(searchTerm.toLowerCase());

    const isCompleted = !!t.championId || t.status === 'finished';
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'finished'
        ? isCompleted
        : !isCompleted;

    const archetype = getTournamentArchetype(t.format);
    const matchesArchetype = filterArchetype === 'all' || archetype === filterArchetype;

    const matchesGame = filterGame === 'all' || t.game === filterGame;

    return matchesSearch && matchesStatus && matchesArchetype && matchesGame;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="tournaments-hub-modal"
        className="relative w-full max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Trung Tâm Giải Đấu (Tournaments Hub)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 font-mono">
                  {tournaments.length} giải
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chọn giải đấu để theo dõi bảng đấu, kết quả trực tiếp và lịch thi đấu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                id="btn-hub-create-tournament"
                onClick={() => {
                  onClose();
                  onOpenNewTournamentModal();
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Tạo Giải Mới
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Lock className="w-3.5 h-3.5" /> Đăng nhập Admin
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:px-6 bg-slate-950/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giải đấu, game..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Archetype 2 Formats Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterArchetype('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterArchetype === 'all'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả dạng
            </button>
            <button
              onClick={() => setFilterArchetype('elimination')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                filterArchetype === 'elimination'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚔️</span>
              <span>Đấu Vòng Loại</span>
            </button>
            <button
              onClick={() => setFilterArchetype('points')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                filterArchetype === 'points'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📊</span>
              <span>Dạng Tính Điểm</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả trạng thái
            </button>
            <button
              onClick={() => setFilterStatus('ongoing')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'ongoing'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đang diễn ra
            </button>
            <button
              onClick={() => setFilterStatus('finished')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'finished'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã bế mạc
            </button>
          </div>

          {/* Game filter */}
          <select
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Tất cả game</option>
            {GAME_PRESETS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tournaments Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {filteredTournaments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Trophy className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
              <p className="text-sm font-semibold">Không tìm thấy giải đấu nào phù hợp</p>
              <p className="text-xs text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTournaments.map((t) => {
                const isSelected = t.id === activeTournamentId;
                const gamePreset = GAME_PRESETS.find((g) => g.id === t.game);
                const isCompleted = !!t.championId || t.status === 'finished';
                const champion = t.participants.find((p) => p.id === t.championId);
                const formatLabel = getFormatDisplayLabel(t.format);

                // Stats
                const totalMatches = t.rounds.flatMap((r) => r.matches).length;
                const finishedMatches = t.rounds
                  .flatMap((r) => r.matches)
                  .filter((m) => m.status === 'finished').length;

                return (
                  <div
                    key={t.id}
                    className={`relative group rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border-indigo-500/80 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/70 hover:bg-slate-900 border-white/10 hover:border-indigo-500/40'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
                            {gamePreset?.badge || t.game.toUpperCase()}
                          </span>

                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border flex items-center gap-1 font-mono ${formatLabel.badgeColor}`}>
                            <span>{formatLabel.emoji}</span>
                            <span>{formatLabel.archetypeLabel}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Đang xem
                            </span>
                          )}

                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Trophy className="w-3 h-3" /> Đã bế mạc
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Đang diễn ra
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                        {t.description || 'Giải đấu Esports cộng đồng Discord'}
                      </p>

                      {/* Sub-format indicator */}
                      <div className="mt-2 text-[11px] text-slate-400 font-medium flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/5">
                        <span className="text-slate-300 font-bold">Thể thức:</span>
                        <span className="text-slate-200">{formatLabel.subLabel}</span>
                      </div>

                      {/* Details & Specs */}
                      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            <strong>{t.participants.length}</strong> đội / tuyển thủ
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            Tiến độ: <strong>{finishedMatches}/{totalMatches}</strong>
                          </span>
                        </div>
                        {t.settings.prizePool && (
                          <div className="col-span-2 flex items-center gap-1.5 text-amber-300 font-medium text-[11px] truncate">
                            <CircleDollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{t.settings.prizePool}</span>
                          </div>
                        )}
                        {champion && (
                          <div className="col-span-2 flex items-center gap-1.5 text-amber-400 font-bold text-[11px] truncate bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Quán quân: {champion.name} 👑</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        id={`btn-view-bracket-${t.id}`}
                        onClick={() => {
                          onSelectTournament(t.id);
                          onClose();
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white'
                        }`}
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{isSelected ? 'Đang xem bảng đấu này' : 'Xem Bảng Đấu'}</span>
                      </button>

                      {isAdmin && onDeleteTournament && tournaments.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa giải đấu "${t.name}" không?`)) {
                              onDeleteTournament(t.id);
                            }
                          }}
                          className="p-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                          title="Xóa giải đấu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Chế độ: <strong className="text-white">{isAdmin ? '👑 Quản Trị Viên (Admin)' : '👁️ Khách (Chỉ Xem)'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
