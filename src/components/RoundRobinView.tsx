import React from 'react';
import { Tournament, Match } from '../types/tournament';
import { calculateRoundRobinStandings } from '../utils/bracketGenerator';
import { MatchCard } from './MatchCard';
import { Table, Trophy, Flame } from 'lucide-react';

interface RoundRobinViewProps {
  tournament: Tournament;
  onOpenMatchModal: (match: Match) => void;
  onQuickWinner?: (match: Match, winnerId: string) => void;
}

export const RoundRobinView: React.FC<RoundRobinViewProps> = ({
  tournament,
  onOpenMatchModal,
  onQuickWinner,
}) => {
  const standings = calculateRoundRobinStandings(tournament.participants, tournament.rounds);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Standings Table Card */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Bảng Xếp Hạng Điểm (Leaderboard)
              </h3>
              <p className="text-xs text-slate-400">
                Thắng = 3 điểm • Thua = 0 điểm • Ưu tiên Hiệu số vòng thắng/thua
              </p>
            </div>
          </div>
          <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full font-mono">
            {tournament.participants.length} Đội tham gia
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 rounded-l-lg">Hạng</th>
                <th className="px-3 py-2.5">Đội / Player</th>
                <th className="px-3 py-2.5 text-center font-bold text-amber-400">Điểm</th>
                <th className="px-3 py-2.5 text-center">Trận đã đấu</th>
                <th className="px-3 py-2.5 text-center text-emerald-400">Thắng</th>
                <th className="px-3 py-2.5 text-center text-rose-400">Thua</th>
                <th className="px-3 py-2.5 text-center">Tỉ số ván (W-L)</th>
                <th className="px-3 py-2.5 text-center rounded-r-lg">Hiệu số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {standings.map((p, idx) => {
                const isTop1 = idx === 0 && (p.stats?.points || 0) > 0;
                const isTop2 = idx === 1 && (p.stats?.points || 0) > 0;
                const isTop3 = idx === 2 && (p.stats?.points || 0) > 0;
                const diff = (p.stats?.roundsWon || 0) - (p.stats?.roundsLost || 0);

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isTop1 ? 'bg-amber-500/10 font-medium' : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {isTop1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                            3
                          </span>
                        ) : (
                          <span className="w-6 h-6 font-mono text-slate-400 text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{p.name}</span>
                          {isTop1 && <Trophy className="w-3.5 h-3.5 text-amber-400 inline" />}
                        </div>
                        {p.discordTag && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {p.discordTag}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-extrabold text-sm text-amber-400">
                      {p.stats?.points || 0}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-slate-300">
                      {p.stats?.matchesPlayed || 0}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-semibold text-emerald-400">
                      {p.stats?.wins || 0}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-semibold text-rose-400">
                      {p.stats?.losses || 0}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-slate-400 text-xs">
                      {p.stats?.roundsWon || 0} - {p.stats?.roundsLost || 0}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold">
                      <span className={diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rounds Fixtures */}
      <div id="tournament-bracket-canvas" className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Lịch & Kết Quả Từng Lượt Đấu
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {tournament.rounds.length} Lượt thi đấu
          </span>
        </div>

        <div className="space-y-8">
          {tournament.rounds.map((round) => (
            <div key={round.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-lg text-xs font-bold">
                  {round.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  BO{round.bestOf}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {round.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    participants={tournament.participants}
                    onOpenMatchModal={onOpenMatchModal}
                    onQuickWinner={onQuickWinner}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
