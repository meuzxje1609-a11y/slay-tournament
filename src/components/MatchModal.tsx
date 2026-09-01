import React, { useState } from 'react';
import { Match, Participant, Tournament } from '../types/tournament';
import { GAME_PRESETS } from '../data/presets';
import {
  X,
  Trophy,
  Swords,
  Mic,
  MapPin,
  Award,
  Link as LinkIcon,
  Check,
  AlertTriangle,
  Lock,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface MatchModalProps {
  match: Match | null;
  tournament: Tournament;
  isAdmin?: boolean;
  onOpenLogin?: () => void;
  onClose: () => void;
  onSaveMatch: (
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
  ) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  match,
  tournament,
  isAdmin = false,
  onOpenLogin,
  onClose,
  onSaveMatch,
}) => {
  if (!match) return null;

  const p1 = tournament.participants.find((p) => p.id === match.participant1Id);
  const p2 = tournament.participants.find((p) => p.id === match.participant2Id);

  const [score1, setScore1] = useState<number>(match.score1 || 0);
  const [score2, setScore2] = useState<number>(match.score2 || 0);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>(match.winnerId || '');
  const [status, setStatus] = useState<Match['status']>(match.status || 'ready');
  const [voiceChannel, setVoiceChannel] = useState<string>(match.voiceChannel || '');
  const [mapPicked, setMapPicked] = useState<string>(match.mapPicked || '');
  const [mvp, setMvp] = useState<string>(match.mvp || '');
  const [notes, setNotes] = useState<string>(match.notes || '');
  const [streamUrl, setStreamUrl] = useState<string>(match.streamUrl || '');
  const [scheduledTime, setScheduledTime] = useState<string>(match.scheduledTime || '');

  // Game preset maps
  const gamePreset = GAME_PRESETS.find((g) => g.id === tournament.game);
  const availableMaps = gamePreset?.maps || [];

  const handleP1Win = (s1: number, s2: number) => {
    if (!p1) return;
    setScore1(s1);
    setScore2(s2);
    setSelectedWinnerId(p1.id);
    setStatus('finished');
  };

  const handleP2Win = (s1: number, s2: number) => {
    if (!p2) return;
    setScore1(s1);
    setScore2(s2);
    setSelectedWinnerId(p2.id);
    setStatus('finished');
  };

  const handleSave = () => {
    let finalWinnerId = selectedWinnerId;
    if (!finalWinnerId && (score1 !== 0 || score2 !== 0)) {
      if (score1 > score2 && p1) finalWinnerId = p1.id;
      else if (score2 > score1 && p2) finalWinnerId = p2.id;
    }

    onSaveMatch(match.id, finalWinnerId, score1, score2, {
      status,
      voiceChannel,
      mapPicked,
      mvp,
      notes,
      streamUrl,
      scheduledTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="match-modal-container"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {isAdmin ? 'Điều Khiển Trận Đấu' : 'Chi Tiết Trận Đấu'} (BO{match.bestOf})
                {!isAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Chế độ xem
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Cập nhật tỉ số, bản đồ & kết quả cho Discord'
                  : 'Xem thông tin cặp đấu, bản đồ và kết quả thi đấu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Guest notification banner */}
          {!isAdmin && (
            <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-slate-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Bạn đang ở chế độ xem. Chỉ Admin mới có quyền cập nhật kết quả.</span>
              </div>
              {onOpenLogin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shrink-0 transition-colors"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          )}

          {/* Teams / Score Board */}
          <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800/80">
            <div className="grid grid-cols-11 items-center gap-2 text-center">
              {/* Participant 1 */}
              <div className="col-span-4 flex flex-col items-center">
                <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-300 flex items-center justify-center mb-1">
                  #{p1?.seed || '?'}
                </span>
                <h4 className="font-bold text-sm text-slate-100 truncate max-w-[140px]">
                  {p1?.name || 'TBD (Chưa rõ)'}
                </h4>
                {p1?.discordTag && (
                  <span className="text-[11px] text-indigo-400 font-mono">
                    {p1.discordTag}
                  </span>
                )}
                {selectedWinnerId === p1?.id && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
                    <Trophy className="w-3 h-3" /> Người Thắng
                  </span>
                )}
              </div>

              {/* Score Inputs / Display */}
              <div className="col-span-3 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-500 uppercase mb-1">Tỉ số</span>
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <input
                      id="input-match-score1"
                      type="number"
                      min="0"
                      max="10"
                      value={score1}
                      onChange={(e) => setScore1(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 h-12 text-center text-xl font-mono font-extrabold bg-slate-900 border-2 border-indigo-500/50 focus:border-indigo-400 rounded-xl text-white outline-none"
                    />
                    <span className="text-slate-600 font-bold text-lg">-</span>
                    <input
                      id="input-match-score2"
                      type="number"
                      min="0"
                      max="10"
                      value={score2}
                      onChange={(e) => setScore2(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 h-12 text-center text-xl font-mono font-extrabold bg-slate-900 border-2 border-indigo-500/50 focus:border-indigo-400 rounded-xl text-white outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-extrabold text-white">
                      {match.score1 ?? 0}
                    </span>
                    <span className="text-slate-600 font-bold text-xl">-</span>
                    <span className="text-3xl font-mono font-extrabold text-white">
                      {match.score2 ?? 0}
                    </span>
                  </div>
                )}
                <span className="text-[11px] text-slate-400 font-mono mt-1">
                  Đấu BO{match.bestOf}
                </span>
              </div>

              {/* Participant 2 */}
              <div className="col-span-4 flex flex-col items-center">
                <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-300 flex items-center justify-center mb-1">
                  #{p2?.seed || '?'}
                </span>
                <h4 className="font-bold text-sm text-slate-100 truncate max-w-[140px]">
                  {p2?.name || 'TBD (Chưa rõ)'}
                </h4>
                {p2?.discordTag && (
                  <span className="text-[11px] text-indigo-400 font-mono">
                    {p2.discordTag}
                  </span>
                )}
                {selectedWinnerId === p2?.id && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
                    <Trophy className="w-3 h-3" /> Người Thắng
                  </span>
                )}
              </div>
            </div>

            {/* Quick Result Selector Buttons (Admin only) */}
            {isAdmin && p1 && p2 && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-400 w-full text-center">
                  ⚡ Chọn nhanh kết quả:
                </span>
                {match.bestOf === 1 ? (
                  <>
                    <button
                      id="btn-quick-p1-win"
                      onClick={() => handleP1Win(1, 0)}
                      className="px-3 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-xs font-semibold rounded-lg text-slate-200 transition-colors"
                    >
                      {p1.name} Thắng (1-0)
                    </button>
                    <button
                      id="btn-quick-p2-win"
                      onClick={() => handleP2Win(0, 1)}
                      className="px-3 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-xs font-semibold rounded-lg text-slate-200 transition-colors"
                    >
                      {p2.name} Thắng (1-0)
                    </button>
                  </>
                ) : match.bestOf === 3 ? (
                  <>
                    <button
                      onClick={() => handleP1Win(2, 0)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p1.name} (2-0)
                    </button>
                    <button
                      onClick={() => handleP1Win(2, 1)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p1.name} (2-1)
                    </button>
                    <button
                      onClick={() => handleP2Win(0, 2)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p2.name} (2-0)
                    </button>
                    <button
                      onClick={() => handleP2Win(1, 2)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p2.name} (2-1)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleP1Win(3, 0)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p1.name} (3-0)
                    </button>
                    <button
                      onClick={() => handleP1Win(3, 1)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p1.name} (3-1)
                    </button>
                    <button
                      onClick={() => handleP1Win(3, 2)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p1.name} (3-2)
                    </button>
                    <button
                      onClick={() => handleP2Win(0, 3)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p2.name} (3-0)
                    </button>
                    <button
                      onClick={() => handleP2Win(1, 3)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p2.name} (3-1)
                    </button>
                    <button
                      onClick={() => handleP2Win(2, 3)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-900/60 border border-slate-700 text-xs font-medium rounded-lg text-slate-200"
                    >
                      {p2.name} (3-2)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Details Form Grid */}
          {isAdmin ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Trạng thái trận đấu:
                </label>
                <select
                  id="select-match-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Match['status'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="pending">Chờ đối thủ (Pending)</option>
                  <option value="ready">Sẵn sàng (Ready)</option>
                  <option value="in_progress">🔴 Đang trực tiếp (Live)</option>
                  <option value="finished">🏁 Đã xong (Finished)</option>
                  <option value="walkover">⚠️ Thắng cuộc do bỏ cuộc (Walkover)</option>
                </select>
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Giờ thi đấu (Timeline):
                </label>
                <input
                  id="input-match-scheduled-time"
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="VD: 19:30 - 31/08"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Voice Channel */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-indigo-400" /> Kênh Voice / Phòng Discord:
                </label>
                <input
                  id="input-match-voice"
                  type="text"
                  value={voiceChannel}
                  onChange={(e) => setVoiceChannel(e.target.value)}
                  placeholder="VD: 🎙️ Voice Thi Đấu 1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Map Picked */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Bản đồ thi đấu (Map):
                </label>
                {availableMaps.length > 0 ? (
                  <select
                    id="select-match-map"
                    value={mapPicked}
                    onChange={(e) => setMapPicked(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Chọn bản đồ --</option>
                    {availableMaps.map((mapName) => (
                      <option key={mapName} value={mapName}>
                        {mapName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={mapPicked}
                    onChange={(e) => setMapPicked(e.target.value)}
                    placeholder="VD: Ascent / Howling Abyss"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {/* MVP Player */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Tuyển thủ xuất sắc (MVP):
                </label>
                <input
                  id="input-match-mvp"
                  type="text"
                  value={mvp}
                  onChange={(e) => setMvp(e.target.value)}
                  placeholder="VD: TenZ / Faker"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stream Link & Notes */}
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" /> Link Stream / VOD:
                  </label>
                  <input
                    type="text"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="VD: https://youtube.com/... hoặc link Discord stream"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ghi chú trận đấu:
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="VD: Trận đấu kéo dài Overtime 15-13, comeback ngoạn mục"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Read-Only Spec for Spectator Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Trạng thái:</span>
                <span className="font-bold text-white capitalize">
                  {match.status === 'in_progress' ? '🔴 Đang trực tiếp' : match.status === 'finished' ? '🏁 Đã hoàn thành' : 'Sẵn sàng'}
                </span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> Giờ thi đấu:
                </span>
                <span className="font-bold text-cyan-300">
                  {match.scheduledTime || 'Theo lịch trình'}
                </span>
              </div>

              {match.voiceChannel && (
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                    <Mic className="w-3 h-3 text-indigo-400" /> Kênh Voice Discord:
                  </span>
                  <span className="font-mono text-indigo-300">{match.voiceChannel}</span>
                </div>
              )}

              {match.mapPicked && (
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> Bản đồ:
                  </span>
                  <span className="font-bold text-emerald-300">{match.mapPicked}</span>
                </div>
              )}

              {match.mvp && (
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> MVP Trận:
                  </span>
                  <span className="font-bold text-amber-300">{match.mvp} 🌟</span>
                </div>
              )}

              {match.streamUrl && (
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-indigo-400" /> Link Xem Trực Tiếp / VOD:
                  </span>
                  <a
                    href={match.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 underline truncate block"
                  >
                    {match.streamUrl}
                  </a>
                </div>
              )}

              {match.notes && (
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Ghi chú:</span>
                  <p className="text-slate-300 italic">{match.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div>
            {!isAdmin && onOpenLogin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <Lock className="w-3.5 h-3.5" /> Đăng nhập Admin để sửa
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
            {isAdmin && (
              <button
                id="btn-save-match-results"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" /> Lưu & Tiến Bảng Đấu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
