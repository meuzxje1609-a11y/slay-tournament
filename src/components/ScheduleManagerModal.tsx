import React, { useState } from 'react';
import { Tournament, Match, ScheduleConfig } from '../types/tournament';
import { autoGenerateTournamentSchedule } from '../utils/bracketGenerator';
import {
  X,
  Calendar,
  Clock,
  Radio,
  PlayCircle,
  Copy,
  Check,
  Sparkles,
  Edit2,
  Tv,
  Users,
  CheckCircle2,
  AlertCircle,
  Layers,
  Flame,
} from 'lucide-react';

interface ScheduleManagerModalProps {
  tournament: Tournament;
  isAdmin?: boolean;
  onOpenLogin?: () => void;
  onClose: () => void;
  onUpdateTournament: (updated: Tournament) => void;
  onOpenDiscordExport?: () => void;
}

export const ScheduleManagerModal: React.FC<ScheduleManagerModalProps> = ({
  tournament,
  isAdmin = false,
  onOpenLogin,
  onClose,
  onUpdateTournament,
  onOpenDiscordExport,
}) => {
  const defaultToday = new Date().toISOString().split('T')[0];
  const savedConfig = tournament.settings.scheduleConfig;

  const [startDate, setStartDate] = useState<string>(savedConfig?.startDate || defaultToday);
  const [startTime, setStartTime] = useState<string>(savedConfig?.startTime || '20:00');
  const [matchDuration, setMatchDuration] = useState<number>(savedConfig?.matchDurationMinutes || 35);
  const [bufferTime, setBufferTime] = useState<number>(savedConfig?.bufferTimeMinutes || 10);
  const [concurrentStreams, setConcurrentStreams] = useState<number>(savedConfig?.concurrentStreams || 2);
  const [voicePrefix, setVoicePrefix] = useState<string>(savedConfig?.voiceRoomPrefix || '🔊 Voice Bàn');

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editCustomTime, setEditCustomTime] = useState<string>('');
  const [editCustomVoice, setEditCustomVoice] = useState<string>('');
  const [copiedDiscord, setCopiedDiscord] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Auto-generate handler
  const handleAutoGenerate = () => {
    const updated = autoGenerateTournamentSchedule(tournament, {
      startDate,
      startTime,
      matchDurationMinutes: Number(matchDuration),
      bufferTimeMinutes: Number(bufferTime),
      concurrentStreams: Number(concurrentStreams),
      voiceRoomPrefix: voicePrefix.trim() || '🔊 Voice Bàn',
    });

    onUpdateTournament(updated);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  // Quick single match schedule edit
  const handleStartEditMatch = (match: Match) => {
    setEditingMatchId(match.id);
    setEditCustomTime(match.scheduledTime || '');
    setEditCustomVoice(match.voiceChannel || '');
  };

  const handleSaveSingleMatch = (matchId: string) => {
    const updatedRounds = tournament.rounds.map((round) => ({
      ...round,
      matches: round.matches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            scheduledTime: editCustomTime.trim() || undefined,
            voiceChannel: editCustomVoice.trim() || undefined,
          };
        }
        return m;
      }),
    }));

    onUpdateTournament({
      ...tournament,
      rounds: updatedRounds,
      updatedAt: Date.now(),
    });
    setEditingMatchId(null);
  };

  // Generate Discord schedule text with dynamic timestamps
  const handleCopyDiscordSchedule = () => {
    const lines = [
      `# 📅 LỊCH THI ĐẤU CHÍNH THỨC - ${tournament.name.toUpperCase()}`,
      `> 📍 **Server:** ${tournament.settings.discordServerName || 'Discord Community'} | **Số bàn phát sóng song song:** ${concurrentStreams} bàn`,
      '',
    ];

    tournament.rounds.forEach((r) => {
      lines.push(`### 🏆 ${r.name.toUpperCase()} (BO${r.bestOf})`);
      r.matches.forEach((m, idx) => {
        const p1 = tournament.participants.find((p) => p.id === m.participant1Id)?.name || 'TBD';
        const p2 = tournament.participants.find((p) => p.id === m.participant2Id)?.name || 'TBD';
        const timeStr = m.scheduledTimestamp
          ? `<t:${m.scheduledTimestamp}:F> (<t:${m.scheduledTimestamp}:R>)`
          : m.scheduledTime
          ? `\`${m.scheduledTime}\``
          : '`Chưa xếp giờ`';
        const voiceStr = m.voiceChannel ? ` | 🎙️ \`${m.voiceChannel}\`` : '';
        const status = m.status === 'finished' ? '✅ *Đã kết thúc*' : m.status === 'live' ? '🔴 **[LIVE]**' : '⏳';

        lines.push(`* Trận ${idx + 1}: **${p1}** 🆚 **${p2}** ➔ ⏰ ${timeStr}${voiceStr} ${status}`);
      });
      lines.push('');
    });

    lines.push('--------------------------------------------------');
    lines.push('👉 *Các đội vui lòng có mặt tại kênh Voice trước 10-15 phút để chuẩn bị ban/pick!* 🔥');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  // Flatten all matches for statistics
  let totalMatchesCount = 0;
  let scheduledCount = 0;
  tournament.rounds.forEach((r) => {
    r.matches.forEach((m) => {
      totalMatchesCount++;
      if (m.scheduledTime) scheduledCount++;
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="schedule-manager-modal"
        className="relative w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Tự Động Tạo Lịch & Quản Lý Timeline Giải Đấu
              </h3>
              <p className="text-xs text-slate-400">
                Tự động chia thời gian, luồng Voice phòng đấu thông minh cho {tournament.participants.length} đội
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

        {/* Modal Body: Two Columns (Config Form + Interactive Timeline) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Automation Config (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Tham số tạo lịch tự động
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {scheduledCount}/{totalMatchesCount} đã xếp
                </span>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-3">
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
                    ⏰ Giờ khai mạc:
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Match Duration & Buffer Break */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ⏳ Thời lượng/ván (phút):
                  </label>
                  <select
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value={15}>15 phút (Solo 1v1 nhanh)</option>
                    <option value={25}>25 phút (ARAM / Tốc chiến)</option>
                    <option value={35}>35 phút (LOL / Valorant BO1)</option>
                    <option value={50}>50 phút (Valorant BO1 dài)</option>
                    <option value={80}>80 phút (BO3 tiêu chuẩn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ☕ Nghỉ giữa trận (phút):
                  </label>
                  <select
                    value={bufferTime}
                    onChange={(e) => setBufferTime(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value={5}>5 phút (Nhanh)</option>
                    <option value={10}>10 phút (Khuyên dùng)</option>
                    <option value={15}>15 phút (Chuẩn giải)</option>
                    <option value={20}>20 phút</option>
                  </select>
                </div>
              </div>

              {/* Concurrent Streams & Voice Prefix */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    🎙️ Số bàn đấu song song:
                  </label>
                  <select
                    value={concurrentStreams}
                    onChange={(e) => setConcurrentStreams(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value={1}>1 Bàn (Đánh tuần tự / Livestream)</option>
                    <option value={2}>2 Bàn song song (Phổ biến)</option>
                    <option value={4}>4 Bàn song song (Đánh nhanh)</option>
                    <option value={8}>8 Bàn đồng loạt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    🔊 Tiền tố phòng Voice:
                  </label>
                  <input
                    type="text"
                    value={voicePrefix}
                    onChange={(e) => setVoicePrefix(e.target.value)}
                    placeholder="VD: 🔊 Voice Bàn"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {isAdmin ? (
                  <button
                    type="button"
                    id="btn-auto-generate-schedule"
                    onClick={handleAutoGenerate}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4" /> Tự Động Tạo Lịch Toàn Bộ Giải
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLogin) onOpenLogin();
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Đăng nhập Admin để xếp lịch tự động
                  </button>
                )}

                {appliedSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1.5 justify-center animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Đã cập nhật lịch thi đấu thành công!
                  </div>
                )}
              </div>
            </div>

            {/* Smart Schedule Logic Overview */}
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs uppercase">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Cơ chế xếp lịch thông minh:
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed list-disc list-inside">
                <li>Các trận trong cùng vòng được chia đều cho các phòng Voice song song.</li>
                <li>Vòng kế tiếp tự động bắt đầu sau khi toàn bộ các trận vòng trước kết thúc.</li>
                <li>Tự động hỗ trợ Discord dynamic timestamp chuẩn theo múi giờ mỗi người xem.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Schedule Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Timeline Chi Tiết Các Cặp Đấu
              </h4>
              <button
                type="button"
                onClick={handleCopyDiscordSchedule}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  copiedDiscord
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[#5865F2]/30'
                }`}
              >
                {copiedDiscord ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDiscord ? 'Đã copy Discord Markdown!' : 'Copy Lịch Cho Discord'}
              </button>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
              {tournament.rounds.map((round) => (
                <div
                  key={round.id}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{round.name}</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                        BO{round.bestOf}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {round.matches.length} trận
                    </span>
                  </div>

                  <div className="space-y-2">
                    {round.matches.map((match, mIdx) => {
                      const p1 = tournament.participants.find((p) => p.id === match.participant1Id);
                      const p2 = tournament.participants.find((p) => p.id === match.participant2Id);
                      const isEditing = editingMatchId === match.id;

                      return (
                        <div
                          key={match.id}
                          className="bg-slate-950/60 p-3 rounded-xl border border-white/5 hover:border-white/15 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500">
                                #{mIdx + 1}
                              </span>
                              <span className="font-bold text-slate-100 truncate">
                                {p1?.name || 'TBD'}
                              </span>
                              <span className="text-slate-500 text-[10px]">vs</span>
                              <span className="font-bold text-slate-100 truncate">
                                {p2?.name || 'TBD'}
                              </span>
                              {match.status === 'finished' && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                                  {match.score1} - {match.score2}
                                </span>
                              )}
                            </div>

                            {/* Schedule info */}
                            {!isEditing ? (
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                                <span className="flex items-center gap-1 text-cyan-300 font-mono">
                                  <Clock className="w-3 h-3" /> {match.scheduledTime || 'Chưa xếp giờ'}
                                </span>
                                {match.voiceChannel && (
                                  <span className="flex items-center gap-1 text-indigo-300 font-mono">
                                    <Tv className="w-3 h-3" /> {match.voiceChannel}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <input
                                  type="text"
                                  value={editCustomTime}
                                  onChange={(e) => setEditCustomTime(e.target.value)}
                                  placeholder="20:00 15/10"
                                  className="w-28 bg-slate-900 border border-cyan-400/60 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={editCustomVoice}
                                  onChange={(e) => setEditCustomVoice(e.target.value)}
                                  placeholder="🔊 Voice Bàn 1"
                                  className="w-32 bg-slate-900 border border-cyan-400/60 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveSingleMatch(match.id)}
                                  className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingMatchId(null)}
                                  className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] rounded"
                                >
                                  Hủy
                                </button>
                              </div>
                            )}
                          </div>

                          {!isEditing && isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleStartEditMatch(match)}
                              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/10 rounded-lg transition-colors self-end sm:self-center"
                              title="Sửa giờ / Voice trận này"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-t border-white/10">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>💡 <em>Lịch thi đấu sẽ tự động đồng bộ trên toàn bộ sơ đồ bảng đấu và các thông báo Discord.</em></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
