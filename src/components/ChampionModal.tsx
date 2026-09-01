import React, { useEffect } from 'react';
import { Tournament } from '../types/tournament';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, MessageSquare, X, Flame } from 'lucide-react';

interface ChampionModalProps {
  tournament: Tournament;
  onClose: () => void;
  onOpenDiscordExport: () => void;
}

export const ChampionModal: React.FC<ChampionModalProps> = ({
  tournament,
  onClose,
  onOpenDiscordExport,
}) => {
  const champion = tournament.participants.find((p) => p.id === tournament.championId);
  const runnerUp = tournament.participants.find((p) => p.id === tournament.runnerUpId);

  useEffect(() => {
    // Fire confetti cannon
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#6366f1', '#ec4899', '#3b82f6'],
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  if (!champion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div
        id="champion-celebration-card"
        className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/25 text-center overflow-hidden flex flex-col items-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Crown Trophy Icon */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/40 animate-bounce">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
        </div>

        {/* Tournament Name */}
        <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3.5 py-1 rounded-full mb-3 backdrop-blur-md shadow-md">
          👑 QUÁN QUÂN {tournament.name.toUpperCase()}
        </span>

        {/* Champion Name */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          {champion.name}
        </h2>

        {champion.discordTag && (
          <p className="text-sm font-mono text-indigo-300 font-semibold mb-3">
            {champion.discordTag}
          </p>
        )}

        {/* Members if 5v5 */}
        {champion.members && champion.members.length > 0 && (
          <div className="bg-white/[0.04] rounded-2xl p-3.5 border border-white/10 my-3 w-full text-xs text-slate-300 backdrop-blur-md">
            <span className="text-slate-400 font-bold block mb-1.5">Thành viên đội tuyển:</span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {champion.members.map((m, idx) => (
                <span key={idx} className="bg-white/10 border border-white/5 px-2.5 py-0.5 rounded-lg text-slate-200">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Runner-up */}
        {runnerUp && (
          <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-2.5 rounded-2xl border border-white/10 text-xs text-slate-300 mb-4 backdrop-blur-md">
            <Award className="w-4 h-4 text-slate-300" />
            <span>Á Quân (Hạng 2): <strong>{runnerUp.name}</strong> {runnerUp.discordTag}</span>
          </div>
        )}

        {/* Prize Pool Breakdown */}
        {tournament.settings.prizes ? (
          <div className="w-full bg-slate-950/60 border border-amber-500/30 rounded-2xl p-3 mb-5 text-left space-y-1.5 backdrop-blur-md">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block text-center mb-1">
              🎁 Phần Thưởng Quán Quân & Giải Đấu
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {tournament.settings.prizes.cash.enabled && tournament.settings.prizes.cash.champion && (
                <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                  <span>💵</span>
                  <span className="truncate"><strong>{tournament.settings.prizes.cash.champion}</strong></span>
                </div>
              )}
              {tournament.settings.prizes.inGame.enabled && tournament.settings.prizes.inGame.champion && (
                <div className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">
                  <span>🎮</span>
                  <span className="truncate"><strong>{tournament.settings.prizes.inGame.champion}</strong></span>
                </div>
              )}
              {tournament.settings.prizes.roles.enabled && tournament.settings.prizes.roles.championRole && (
                <div className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-500/20 text-purple-300 flex items-center gap-1.5">
                  <span>👑</span>
                  <span className="truncate"><strong>{tournament.settings.prizes.roles.championRole}</strong></span>
                </div>
              )}
              {tournament.settings.prizes.other.enabled && tournament.settings.prizes.other.items.length > 0 && (
                <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
                  <span>🎁</span>
                  <span className="truncate">{tournament.settings.prizes.other.items[0]}</span>
                </div>
              )}
            </div>
          </div>
        ) : tournament.settings.prizePool ? (
          <div className="text-xs text-amber-200 font-medium bg-amber-950/40 border border-amber-800/50 px-3.5 py-1.5 rounded-xl mb-6 backdrop-blur-md">
            💰 Phần thưởng: <strong>{tournament.settings.prizePool}</strong>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={() => {
              onClose();
              onOpenDiscordExport();
            }}
            className="flex-1 px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#5865F2]/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-4 h-4" /> Xuất Thông Báo Discord
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-all"
          >
            Xem Lại Bảng Đấu
          </button>
        </div>
      </div>
    </div>
  );
};
