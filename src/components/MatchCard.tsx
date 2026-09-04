import React, { useState } from 'react';
import { Match, Participant } from '../types/tournament';
import { Swords, Trophy, Mic, ShieldAlert, CheckCircle2, Sparkles, GripVertical } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  participants: Participant[];
  isAdmin?: boolean;
  onOpenMatchModal: (match: Match) => void;
  onQuickWinner?: (match: Match, winnerId: string) => void;
  onSwapMatchSlots?: (sourceMatchId: string, sourceSlot: 1 | 2, targetMatchId: string, targetSlot: 1 | 2) => void;
  onAddParticipant?: (match: Match, slot: 1 | 2) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  participants,
  isAdmin = false,
  onOpenMatchModal,
  onQuickWinner,
  onSwapMatchSlots,
  onAddParticipant,
}) => {
  const [dragOverSlot, setDragOverSlot] = useState<1 | 2 | null>(null);

  const p1 = participants.find((p) => p.id === match.participant1Id);
  const p2 = participants.find((p) => p.id === match.participant2Id);

  const isBye = Boolean(match.notes?.includes('BYE'));
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isReady = match.status === 'ready';

  const p1IsWinner = match.winnerId && match.winnerId === p1?.id;
  const p2IsWinner = match.winnerId && match.winnerId === p2?.id;

  const canDrag = isAdmin && Boolean(onSwapMatchSlots);

  const handleDragStart = (e: React.DragEvent, slot: 1 | 2) => {
    if (!canDrag) return;
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ matchId: match.id, slot, participantId: slot === 1 ? p1?.id : p2?.id })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slot: 1 | 2) => {
    if (!canDrag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot !== slot) {
      setDragOverSlot(slot);
    }
  };

  const handleDrop = (e: React.DragEvent, slot: 1 | 2) => {
    if (!canDrag || !onSwapMatchSlots) return;
    e.preventDefault();
    setDragOverSlot(null);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.matchId && (data.slot === 1 || data.slot === 2)) {
        onSwapMatchSlots(data.matchId, data.slot, match.id, slot);
      }
    } catch (err) {
      console.error('Drop swap error:', err);
    }
  };

  return (
    <div
      id={`match-card-${match.id}`}
      className={`relative w-full max-w-sm mx-auto rounded-xl transition-all duration-200 border text-xs sm:text-sm overflow-hidden shadow-lg ${
        isLive
          ? 'border-rose-500 bg-slate-900/95 ring-2 ring-rose-500/50 shadow-rose-500/20'
          : isBye
          ? 'border-purple-500/40 bg-slate-900/80 shadow-purple-950/20'
          : isFinished
          ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
          : isReady
          ? 'border-indigo-500/50 bg-slate-900/90 hover:border-indigo-400 hover:shadow-indigo-500/20'
          : 'border-slate-800/60 bg-slate-950/60 opacity-75'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          {isLive ? (
            <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> LIVE
            </span>
          ) : isBye ? (
            <span className="flex items-center gap-1 text-purple-300 font-semibold bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-400" /> Đặc cách (BYE)
            </span>
          ) : isFinished ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Xong
            </span>
          ) : isReady ? (
            <span className="flex items-center gap-1 text-indigo-400 font-medium">
              <Swords className="w-3 h-3" /> Sẵn sàng
            </span>
          ) : (
            <span className="text-slate-500">Chờ đối thủ</span>
          )}
          <span className="text-slate-600">•</span>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px]">
            BO{match.bestOf}
          </span>
        </div>

        {match.voiceChannel && (
          <div className="flex items-center gap-1 text-slate-400 truncate max-w-[100px]" title={match.voiceChannel}>
            <Mic className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate text-[10px]">{match.voiceChannel.replace('🔊 Voice ', '')}</span>
          </div>
        )}
      </div>

      {/* Teams / Participants Body */}
      <div className="p-2 space-y-1.5">
        {/* Participant 1 */}
        <div
          draggable={canDrag}
          onDragStart={(e) => handleDragStart(e, 1)}
          onDragOver={(e) => handleDragOver(e, 1)}
          onDragLeave={() => setDragOverSlot(null)}
          onDrop={(e) => handleDrop(e, 1)}
            onClick={() => p1 ? onOpenMatchModal(match) : onAddParticipant?.(match, 1)}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
            dragOverSlot === 1
              ? 'ring-2 ring-indigo-400 bg-indigo-900/60 scale-[1.02]'
              : isBye && p1
              ? 'bg-purple-950/40 text-purple-200 font-semibold border border-purple-500/30'
              : p1IsWinner
              ? 'bg-indigo-950/60 text-indigo-200 font-bold border border-indigo-500/40'
              : match.winnerId && !p1IsWinner
              ? 'text-slate-500 opacity-60'
              : 'hover:bg-slate-800/80 text-slate-200'
          } ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}
          title={canDrag ? 'Kéo thả để hoán đổi vị trí hoặc đối thủ' : undefined}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {canDrag && (
              <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-400 shrink-0" />
            )}
            <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[11px] flex items-center justify-center shrink-0 border border-slate-700">
              {p1 ? p1.seed : '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-xs sm:text-sm">
                {p1?.name || (isBye ? 'Miễn đấu (BYE)' : 'TBD (Chưa rõ)')}
              </p>
              {p1?.discordTag && (
                <p className="text-[10px] text-slate-400 font-normal truncate">
                  {p1.discordTag}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isBye && p1 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Vào vòng trong ➔
              </span>
            ) : (
              <>
                {p1IsWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />}
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs ${
                    p1IsWinner
                      ? 'bg-indigo-600 text-white'
                      : isFinished
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  {p1 ? match.score1 : '-'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Participant 2 */}
        <div
          draggable={canDrag}
          onDragStart={(e) => handleDragStart(e, 2)}
          onDragOver={(e) => handleDragOver(e, 2)}
          onDragLeave={() => setDragOverSlot(null)}
          onDrop={(e) => handleDrop(e, 2)}
          onClick={() => p2 ? onOpenMatchModal(match) : onAddParticipant?.(match, 2)}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
            dragOverSlot === 2
              ? 'ring-2 ring-indigo-400 bg-indigo-900/60 scale-[1.02]'
              : isBye && p2
              ? 'bg-purple-950/40 text-purple-200 font-semibold border border-purple-500/30'
              : p2IsWinner
              ? 'bg-indigo-950/60 text-indigo-200 font-bold border border-indigo-500/40'
              : match.winnerId && !p2IsWinner
              ? 'text-slate-500 opacity-60'
              : 'hover:bg-slate-800/80 text-slate-200'
          } ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}
          title={canDrag ? 'Kéo thả để hoán đổi vị trí hoặc đối thủ' : undefined}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {canDrag && (
              <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-400 shrink-0" />
            )}
            <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[11px] flex items-center justify-center shrink-0 border border-slate-700">
              {p2 ? p2.seed : '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-xs sm:text-sm">
                {p2?.name || (isBye ? 'Miễn đấu (BYE)' : 'TBD (Chưa rõ)')}
              </p>
              {p2?.discordTag && (
                <p className="text-[10px] text-slate-400 font-normal truncate">
                  {p2.discordTag}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isBye && p2 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Vào vòng trong ➔
              </span>
            ) : (
              <>
                {p2IsWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />}
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs ${
                    p2IsWinner
                      ? 'bg-indigo-600 text-white'
                      : isFinished
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  {p2 ? match.score2 : '-'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="px-2.5 py-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        {isBye ? (
          <span className="text-[10px] text-purple-300/90 truncate max-w-[200px]">
            ✨ Đặc cách thẳng vào vòng tiếp theo
          </span>
        ) : match.mapPicked ? (
          <span className="text-[10px] text-amber-400/90 truncate max-w-[130px]" title={match.mapPicked}>
            🗺️ {match.mapPicked}
          </span>
        ) : match.scheduledTime ? (
          <span className="text-[10px] text-slate-400 truncate">⏰ {match.scheduledTime}</span>
        ) : (
          <span className="text-[10px] text-slate-500">
            {isAdmin ? 'Nhấp để chỉnh tỉ số' : 'Nhấp xem chi tiết'}
          </span>
        )}

        <button
          id={`btn-open-match-${match.id}`}
            onClick={() => p1 ? onOpenMatchModal(match) : onAddParticipant?.(match, 1)}
          className={`hover:underline font-medium text-[11px] ${
            isBye ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-400 hover:text-indigo-300'
          }`}
        >
          {isBye ? 'Chi tiết' : isAdmin ? (isFinished ? 'Sửa điểm' : 'Nhập điểm ➔') : 'Xem chi tiết'}
        </button>
      </div>
    </div>
  );
};
