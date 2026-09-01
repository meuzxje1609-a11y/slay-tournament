import React, { useState } from 'react';
import { Tournament, Match, Participant } from '../types/tournament';
import { MatchCard } from './MatchCard';
import { Trophy, ArrowUpRight, ArrowDownRight, Crown, LayoutGrid, GitBranch, Award } from 'lucide-react';

interface DoubleEliminationViewProps {
  tournament: Tournament;
  onOpenMatchModal?: (match: Match) => void;
  onSelectMatch?: (match: Match) => void;
  onQuickWinner?: (match: Match, winnerId: string) => void;
}

export const DoubleEliminationView: React.FC<DoubleEliminationViewProps> = ({
  tournament,
  onOpenMatchModal,
  onSelectMatch,
  onQuickWinner,
}) => {
  const handleOpenMatchModal = onOpenMatchModal || onSelectMatch || (() => {});
  const [activeTab, setActiveTab] = useState<'all' | 'upper' | 'lower' | 'grand_final' | string>('all');
  const [displayMode, setDisplayMode] = useState<'grid' | 'tree'>('grid');

  const upperRounds = tournament.rounds.filter((r) => r.bracketSection === 'winners');
  const lowerRounds = tournament.rounds.filter((r) => r.bracketSection === 'losers');
  const grandFinalRound = tournament.rounds.find((r) => r.bracketSection === 'grand_final');

  const champion = tournament.participants.find((p) => p.id === tournament.championId);
  const runnerUp = tournament.participants.find((p) => p.id === tournament.runnerUpId);

  return (
    <div className="w-full flex flex-col bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-2xl p-4 sm:p-5 space-y-4">
      {/* Navigation Sub-Tabs & View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Double Elimination (Nhánh Thắng / Thua)
          </span>
          <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
            2 Mạng (Winners & Losers)
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              displayMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dạng Lưới (Grid)</span>
          </button>
          <button
            onClick={() => setDisplayMode('tree')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              displayMode === 'tree'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sơ Đồ Cây (Tree)</span>
          </button>
        </div>
      </div>

      {/* Round & Section Selection Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          id="tab-de-all"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Tất cả nhánh
        </button>

        <button
          id="tab-de-upper"
          onClick={() => setActiveTab('upper')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1 transition-all ${
            activeTab === 'upper'
              ? 'bg-blue-600 text-white border-blue-400 shadow-md'
              : 'bg-slate-900/90 text-blue-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-300" /> Nhánh Thắng (WB)
        </button>

        {upperRounds.map((round) => (
          <button
            key={round.id}
            onClick={() => setActiveTab(round.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              activeTab === round.id
                ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {round.name} ({round.matches.length})
          </button>
        ))}

        <button
          id="tab-de-lower"
          onClick={() => setActiveTab('lower')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1 transition-all ${
            activeTab === 'lower'
              ? 'bg-rose-600 text-white border-rose-400 shadow-md'
              : 'bg-slate-900/90 text-rose-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-300" /> Nhánh Thua (LB)
        </button>

        {lowerRounds.map((round) => (
          <button
            key={round.id}
            onClick={() => setActiveTab(round.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              activeTab === round.id
                ? 'bg-rose-600 text-white border-rose-400 shadow-md font-bold'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {round.name} ({round.matches.length})
          </button>
        ))}

        <button
          id="tab-de-gf"
          onClick={() => setActiveTab('grand_final')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1 transition-all ${
            activeTab === 'grand_final'
              ? 'bg-amber-600 text-white border-amber-400 shadow-md'
              : 'bg-slate-900/90 text-amber-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-300" /> Chung Kết Tổng & Vinh Danh
        </button>
      </div>

      {/* Main Bracket Area */}
      <div id="tournament-bracket-canvas" className="w-full pt-2">
        {displayMode === 'grid' ? (
          /* GRID VIEW */
          <div className="space-y-8">
            {/* Specific round selected */}
            {tournament.rounds
              .filter((r) => activeTab === r.id || (activeTab === 'upper' && r.bracketSection === 'winners') || (activeTab === 'lower' && r.bracketSection === 'losers') || activeTab === 'all')
              .map((round) => (
                <div key={round.id} id={`round-grid-section-${round.id}`} className="space-y-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/80 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${round.bracketSection === 'winners' ? 'bg-blue-500' : round.bracketSection === 'losers' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                      <h4 className="text-sm font-bold text-white tracking-wide">{round.name}</h4>
                      <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded font-mono">BO{round.bestOf}</span>
                      <span className="text-xs text-slate-400">• {round.matches.length} Trận</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {round.matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        participants={tournament.participants}
                        onOpenMatchModal={handleOpenMatchModal}
                        onQuickWinner={onQuickWinner}
                      />
                    ))}
                  </div>
                </div>
              ))}

            {/* Grand Finals & Champion section */}
            {(activeTab === 'all' || activeTab === 'grand_final') && grandFinalRound && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
                      👑 Trận Chung Kết Tổng (Grand Finals)
                    </span>
                    <div className="w-full">
                      {grandFinalRound.matches.map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          participants={tournament.participants}
                          onOpenMatchModal={handleOpenMatchModal}
                          onQuickWinner={onQuickWinner}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/40">
                      <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      👑 QUÁN QUÂN CHUNG CUỘC
                    </span>
                    <h4 className="text-lg font-black text-white mt-1 mb-0.5">
                      {champion ? champion.name : 'Chờ trận chung kết'}
                    </h4>
                    {champion?.discordTag && (
                      <p className="text-xs text-amber-300 font-mono">{champion.discordTag}</p>
                    )}
                    {runnerUp && (
                      <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800 w-full">
                        Á Quân: <strong>{runnerUp.name}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* TREE VIEW */
          <div className="space-y-10 overflow-x-auto pb-6">
            {/* UPPER BRACKET */}
            {(activeTab === 'all' || activeTab === 'upper') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                    Upper Bracket (Nhánh Thắng)
                  </h3>
                </div>

                <div className="overflow-x-auto py-2">
                  <div className="inline-flex gap-8 px-2 min-w-max items-start">
                    {upperRounds.map((round) => (
                      <div key={round.id} className="flex flex-col items-center min-w-[270px]">
                        <span className="mb-3 inline-block bg-blue-950/60 border border-blue-800/80 px-3 py-1 rounded-lg text-xs font-bold text-blue-300">
                          {round.name}
                        </span>
                        <div className="flex flex-col space-y-6 pt-1">
                          {round.matches.map((match) => (
                            <MatchCard
                              key={match.id}
                              match={match}
                              participants={tournament.participants}
                              onOpenMatchModal={handleOpenMatchModal}
                              onQuickWinner={onQuickWinner}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOWER BRACKET */}
            {(activeTab === 'all' || activeTab === 'lower') && (
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                    Lower Bracket (Nhánh Thua - Cứu Mạng)
                  </h3>
                </div>

                <div className="overflow-x-auto py-2">
                  <div className="inline-flex gap-8 px-2 min-w-max items-start">
                    {lowerRounds.map((round) => (
                      <div key={round.id} className="flex flex-col items-center min-w-[270px]">
                        <span className="mb-3 inline-block bg-rose-950/60 border border-rose-800/80 px-3 py-1 rounded-lg text-xs font-bold text-rose-300">
                          {round.name}
                        </span>
                        <div className="flex flex-col space-y-6 pt-1">
                          {round.matches.map((match) => (
                            <MatchCard
                              key={match.id}
                              match={match}
                              participants={tournament.participants}
                              onOpenMatchModal={handleOpenMatchModal}
                              onQuickWinner={onQuickWinner}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GRAND FINALS & CHAMPION */}
            {(activeTab === 'all' || activeTab === 'grand_final') && grandFinalRound && (
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                    Chung Kết Tổng (Grand Finals) - Đỉnh Cao Quyết Định
                  </h3>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 py-4">
                  <div className="flex flex-col items-center">
                    <span className="mb-3 bg-amber-950/80 border border-amber-500/50 px-4 py-1 rounded-lg text-xs font-extrabold text-amber-300">
                      {grandFinalRound.name} (BO{grandFinalRound.bestOf})
                    </span>
                    {grandFinalRound.matches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        participants={tournament.participants}
                        onOpenMatchModal={handleOpenMatchModal}
                        onQuickWinner={onQuickWinner}
                      />
                    ))}
                  </div>

                  <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl text-center min-w-[260px] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/40">
                      <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      👑 QUÁN QUÂN CHUNG CUỘC
                    </span>
                    <h4 className="text-lg font-black text-white mt-1 mb-0.5">
                      {champion ? champion.name : 'Chờ trận chung kết'}
                    </h4>
                    {champion?.discordTag && (
                      <p className="text-xs text-amber-300 font-mono">{champion.discordTag}</p>
                    )}
                    {runnerUp && (
                      <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800 w-full">
                        Á Quân: <strong>{runnerUp.name}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

