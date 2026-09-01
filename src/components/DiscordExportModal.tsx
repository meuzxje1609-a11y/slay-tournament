import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import {
  formatDiscordAnnouncement,
  formatDiscordNextMatches,
  formatDiscordStandings,
  formatDiscordChampion,
  formatDiscordRollcall,
} from '../utils/discordFormatter';
import { X, Copy, Check, MessageSquare, Megaphone, Swords, BarChart3, Crown, UserCheck } from 'lucide-react';

interface DiscordExportModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const DiscordExportModal: React.FC<DiscordExportModalProps> = ({
  tournament,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<
    'announce' | 'matches' | 'standings' | 'champion' | 'rollcall'
  >('announce');
  const [copied, setCopied] = useState<boolean>(false);

  let outputText = '';
  if (selectedTab === 'announce') outputText = formatDiscordAnnouncement(tournament);
  else if (selectedTab === 'matches') outputText = formatDiscordNextMatches(tournament);
  else if (selectedTab === 'standings') outputText = formatDiscordStandings(tournament);
  else if (selectedTab === 'champion') outputText = formatDiscordChampion(tournament);
  else if (selectedTab === 'rollcall') outputText = formatDiscordRollcall(tournament);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="discord-export-modal"
        className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#5865F2]/20 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Xuất Nội Dung Discord Markdown
              </h3>
              <p className="text-xs text-slate-400">
                Sao chép văn bản đã format sẵn emoji & tag để dán vào kênh Discord
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

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-white/[0.02] border-b border-white/10 text-xs">
          <button
            id="tab-discord-announce"
            onClick={() => setSelectedTab('announce')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              selectedTab === 'announce'
                ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" /> 📢 Thông Báo
          </button>

          <button
            id="tab-discord-matches"
            onClick={() => setSelectedTab('matches')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              selectedTab === 'matches'
                ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" /> ⚔️ Cặp Đấu Tiếp Theo
          </button>

          <button
            id="tab-discord-standings"
            onClick={() => setSelectedTab('standings')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              selectedTab === 'standings'
                ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> 📊 Bảng Đấu & BXH
          </button>

          <button
            id="tab-discord-champion"
            onClick={() => setSelectedTab('champion')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              selectedTab === 'champion'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" /> 🏆 Quán Quân
          </button>

          <button
            id="tab-discord-rollcall"
            onClick={() => setSelectedTab('rollcall')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              selectedTab === 'rollcall'
                ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> 📋 Điểm Danh
          </button>
        </div>

        {/* Text Preview Area */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="relative">
            <textarea
              id="textarea-discord-output"
              readOnly
              rows={13}
              value={outputText}
              className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-4 font-mono text-xs text-slate-200 focus:outline-none select-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 <em>Mẹo: Bạn có thể dán trực tiếp vào bất kỳ kênh chat Discord nào (#announcements, #esports-bracket, #general).</em>
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white/[0.03] border-t border-white/10">
          <span className="text-xs text-slate-400">
            {outputText.length} Ký tự
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Đóng
            </button>
            <button
              id="btn-copy-discord-markdown"
              onClick={handleCopy}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-lg ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[#5865F2]/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Đã sao chép vào Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Sao Chép Cho Discord
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
