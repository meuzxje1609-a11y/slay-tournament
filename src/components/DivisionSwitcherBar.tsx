import React from 'react';
import { Tournament, TournamentDivision } from '../types/tournament';
import { SectIcon } from './SectIcon';
import { Swords, Plus, Trophy, CheckCircle2, ChevronRight, Users } from 'lucide-react';

interface DivisionSwitcherBarProps {
  tournament?: Tournament | null;
  divisions?: TournamentDivision[];
  activeDivisionId?: string;
  onSelectDivision: (divisionId: string) => void;
  onOpenSetupModal?: () => void;
  onOpenRosterManager?: () => void;
  onAddDivision?: (newDiv: Partial<TournamentDivision>) => void;
  onEditDivision?: (divisionId: string, updatedFields: Partial<TournamentDivision>) => void;
  onDeleteDivision?: (divisionId: string) => void;
  isAdmin?: boolean;
}

export const DivisionSwitcherBar: React.FC<DivisionSwitcherBarProps> = ({
  tournament,
  divisions: propDivisions,
  activeDivisionId,
  onSelectDivision,
  onOpenSetupModal,
  onOpenRosterManager,
  isAdmin = true,
}) => {
  const divisions = propDivisions || tournament?.divisions || [];
  if (divisions.length === 0) return null;

  const currentId = activeDivisionId || divisions[0]?.id;
  const currentDiv = divisions.find((d) => d.id === currentId);

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-lg backdrop-blur-md space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>BẢNG ĐẤU LƯU PHÁI ({divisions.length} BẢNG)</span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                Solo 1v1 NTH
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Chọn lưu phái để xem nhánh đấu và tiến độ thi đấu tương ứng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && onOpenRosterManager && (
            <button
              onClick={onOpenRosterManager}
              className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all shadow-sm"
              title="Nhập danh sách đấu thủ cho bảng đang chọn"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chỉnh Sửa Player {currentDiv ? `(${currentDiv.name})` : ''}</span>
            </button>
          )}

          {isAdmin && onOpenSetupModal && (
            <button
              onClick={onOpenSetupModal}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Bảng Đấu</span>
            </button>
          )}
        </div>
      </div>

      {/* Division Tabs Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
        {divisions.map((div, idx) => {
          const isActive = div.id === currentId;
          const participantCount = div.participants?.length || 0;
          const totalMatches = div.rounds?.reduce((acc, r) => acc + r.matches.length, 0) || 0;
          const finishedMatches = div.rounds?.reduce(
            (acc, r) => acc + r.matches.filter((m) => m.status === 'finished').length,
            0
          ) || 0;
          // A division is complete only after its final has an explicitly saved champion.
          // Do not treat every match being marked finished as a completed tournament.
          const isCompleted = Boolean(div.championId);

          // Find champion player name if available
          const champion = div.championId
            ? div.participants.find((p) => p.id === div.championId)
            : null;

          return (
            <button
              key={div.id}
              onClick={() => onSelectDivision(div.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 shrink-0 transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white border-indigo-400/80 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30 scale-[1.02]'
                  : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <SectIcon icon={div.sectIcon || '⚔️'} name={div.name} size="md" />
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold truncate">{div.name}</span>
                  {isCompleted ? (
                    <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                      <Trophy className="w-2.5 h-2.5 text-amber-400" />
                      Xong
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.2 rounded">
                      {finishedMatches}/{totalMatches}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-300/80 font-mono flex items-center gap-1">
                  <span>{participantCount} đấu thủ</span>
                  {champion && (
                    <span className="text-amber-300 font-bold truncate max-w-[90px]">
                      • 👑 {champion.name}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
