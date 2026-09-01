import React, { useState, useRef, useEffect } from 'react';
import { Tournament } from '../types/tournament';
import { GAME_PRESETS } from '../data/presets';
import { toPng } from 'html-to-image';
import {
  Trophy,
  Plus,
  MessageSquare,
  Download,
  CircleDollarSign,
  Users,
  Settings,
  Check,
  Share2,
  Tv,
  HelpCircle,
  Calendar,
  Lock,
  Unlock,
  Shield,
  LogOut,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';

interface NavbarProps {
  tournament: Tournament;
  tournamentsList: Tournament[];
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenTournamentsHub: () => void;
  onSelectTournament: (id: string) => void;
  onOpenNewTournamentModal: () => void;
  onOpenEditTournamentModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenDiscordExport: () => void;
  onOpenCoinToss: () => void;
  onOpenRosterManager: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  tournament,
  tournamentsList,
  isAdmin,
  onOpenLogin,
  onLogout,
  onOpenTournamentsHub,
  onSelectTournament,
  onOpenNewTournamentModal,
  onOpenEditTournamentModal,
  onOpenScheduleModal,
  onOpenDiscordExport,
  onOpenCoinToss,
  onOpenRosterManager,
  onExportJSON,
  onImportJSON,
}) => {
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [showImageDropdown, setShowImageDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const gamePreset = GAME_PRESETS.find((g) => g.id === tournament.game);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowImageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadBracketImage = async (targetId?: string, customName?: string) => {
    setShowImageDropdown(false);
    const elementId = targetId || 'tournament-bracket-canvas';
    const node = document.getElementById(elementId);
    if (!node) {
      alert('Không tìm thấy vùng bảng đấu để xuất ảnh!');
      return;
    }

    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(node, {
        backgroundColor: '#020617',
        cacheBust: true,
        pixelRatio: 2,
      });

      const fileName = customName
        ? `${tournament.name.replace(/\s+/g, '_')}_${customName.replace(/\s+/g, '_')}.png`
        : `${tournament.name.replace(/\s+/g, '_')}_Bracket.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting bracket image:', err);
      alert('Đã xảy ra lỗi khi tạo ảnh bảng đấu. Bạn có thể chụp màn hình trực tiếp!');
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand & Active Tournament Info */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenTournamentsHub}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0 transition-transform active:scale-95"
              title="Mở Danh Sách Tất Cả Giải Đấu"
            >
              <Trophy className="w-5 h-5" />
            </button>

            <div className="shrink-0 max-w-xs sm:max-w-md">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight whitespace-nowrap">
                  {tournament.name}
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 whitespace-nowrap hidden md:block">
                {tournament.description || 'Tournament Discord Server Slay'}
              </p>
            </div>
          </div>

          {/* Center: Tournaments Hub Trigger Button - Cân giữa cụm SLAY TOURNAMENT và Tạo Giải Mới */}
          <div className="flex items-center justify-center mx-auto px-2">
            <button
              id="btn-open-tournaments-hub-nav"
              onClick={onOpenTournamentsHub}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm hover:border-indigo-400"
              title="Khám phá và xem tất cả các giải đấu"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span>Tất Cả Giải ({tournamentsList.length})</span>
            </button>
          </div>

          {/* Right: Actions and Auth Status */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Admin Only Actions: Tạo Giải Mới, Lịch Đấu, Xuất Discord, Tải Ảnh, Coin Toss, Roster, Cấu Hình */}
            {isAdmin && (
              <>
                {/* Create New Tournament */}
                <button
                  id="btn-create-new-tournament"
                  onClick={onOpenNewTournamentModal}
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all shrink-0"
                  title="Tạo giải đấu mới"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Tạo Giải Mới</span>
                </button>

                {/* Schedule Manager */}
                <button
                  id="btn-open-schedule-manager"
                  onClick={onOpenScheduleModal}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all shrink-0"
                  title="Xem & Quản lý lịch thi đấu"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden md:inline">Lịch Đấu</span>
                </button>

                {/* Discord Markdown Export */}
                <button
                  id="btn-open-discord-export-nav"
                  onClick={onOpenDiscordExport}
                  className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#5865F2]/20 flex items-center gap-1.5 transition-all shrink-0"
                  title="Sao chép nội dung cho Discord"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden md:inline">Xuất Discord</span>
                </button>

                {/* Download Bracket Image with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    id="btn-download-bracket-image"
                    disabled={isExportingImage}
                    onClick={() => setShowImageDropdown(!showImageDropdown)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shrink-0"
                    title="Tải ảnh sơ đồ hoặc từng vòng đấu PNG"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span className="hidden lg:inline">{isExportingImage ? 'Đang xuất...' : 'Tải Ảnh'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {showImageDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        Tùy chọn Tải Ảnh PNG
                      </div>

                      {/* Download Full Canvas */}
                      <button
                        onClick={() => handleDownloadBracketImage('tournament-bracket-canvas', 'Toan_Bo_Bang_Dau')}
                        className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-xl text-xs text-slate-200 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-white">Toàn bộ Bảng đấu</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Full</span>
                      </button>

                      {/* Download Individual Rounds */}
                      <div className="mt-1 pt-1 border-t border-slate-800/60">
                        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 uppercase">
                          Từng vòng đấu riêng biệt:
                        </div>
                        {tournament.rounds.map((round) => (
                          <button
                            key={round.id}
                            onClick={() => handleDownloadBracketImage(`round-grid-section-${round.id}`, round.name)}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between group transition-colors"
                          >
                            <span className="truncate pr-2">{round.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {round.matches.length} trận
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Coin Toss / Veto */}
                <button
                  id="btn-open-coin-toss"
                  onClick={onOpenCoinToss}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl transition-colors"
                  title="Tung đồng xu & Cấm chọn Map"
                >
                  <CircleDollarSign className="w-4 h-4" />
                </button>

                {/* Roster Manager */}
                <button
                  id="btn-open-roster-manager"
                  onClick={onOpenRosterManager}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl transition-colors"
                  title="Quản lý Roster & Discord Tags"
                >
                  <Users className="w-4 h-4" />
                </button>

                {/* Edit Settings */}
                <button
                  id="btn-open-edit-tournament"
                  onClick={onOpenEditTournamentModal}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors"
                  title="Cấu hình giải đấu"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Authentication Button & Badge */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-800">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Admin
                </span>
                <button
                  id="btn-admin-logout"
                  onClick={onLogout}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 rounded-xl transition-all flex items-center gap-1 text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap"
                  title="Đăng xuất tài khoản Admin"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-800">
                <button
                  id="btn-open-admin-login"
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap"
                  title="Đăng nhập tài khoản Admin (admin / admin)"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Đăng nhập</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

