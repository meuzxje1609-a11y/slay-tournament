import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import { GAME_PRESETS } from '../data/presets';
import { X, CircleDollarSign, Swords, Sparkles, Check, Copy, RotateCcw, Shield, Zap } from 'lucide-react';

interface CoinTossModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const CoinTossModal: React.FC<CoinTossModalProps> = ({
  tournament,
  onClose,
}) => {
  const [activeTool, setActiveTool] = useState<'coin' | 'veto'>('coin');

  // Coin Toss State
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [coinResult, setCoinResult] = useState<'HEADS' | 'TAILS' | null>(null);
  const [team1Name, setTeam1Name] = useState<string>(
    tournament.participants[0]?.name || 'Đội 1 (Xanh)'
  );
  const [team2Name, setTeam2Name] = useState<string>(
    tournament.participants[1]?.name || 'Đội 2 (Đỏ)'
  );
  const [team1Call, setTeam1Call] = useState<'HEADS' | 'TAILS'>('HEADS');

  // Map Veto State
  const gamePreset = GAME_PRESETS.find((g) => g.id === tournament.game);
  const initialMaps = gamePreset?.maps && gamePreset.maps.length > 0 
    ? gamePreset.maps 
    : ['Ascent', 'Bind', 'Haven', 'Split', 'Sunset', 'Lotus', 'Abyss'];

  const [mapList, setMapList] = useState<{ name: string; status: 'available' | 'banned' | 'picked'; by?: string }[]>(
    initialMaps.map((m) => ({ name: m, status: 'available' }))
  );
  const [currentTurnTeam, setCurrentTurnTeam] = useState<string>(team1Name);
  const [vetoLogs, setVetoLogs] = useState<string[]>([]);
  const [vetoCopied, setVetoCopied] = useState<boolean>(false);

  // Flip the coin
  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setCoinResult(null);

    setTimeout(() => {
      const outcome: 'HEADS' | 'TAILS' = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
      setCoinResult(outcome);
      setIsFlipping(false);
    }, 1200);
  };

  // Map Ban
  const handleBanMap = (mapName: string) => {
    setMapList((prev) =>
      prev.map((m) =>
        m.name === mapName ? { ...m, status: 'banned', by: currentTurnTeam } : m
      )
    );
    const log = `🚫 **${currentTurnTeam}** CẤM (Ban) bản đồ: **${mapName}**`;
    setVetoLogs((prev) => [...prev, log]);
    setCurrentTurnTeam((prev) => (prev === team1Name ? team2Name : team1Name));
  };

  // Map Pick
  const handlePickMap = (mapName: string) => {
    setMapList((prev) =>
      prev.map((m) =>
        m.name === mapName ? { ...m, status: 'picked', by: currentTurnTeam } : m
      )
    );
    const log = `✅ **${currentTurnTeam}** CHỌN (Pick) bản đồ: **${mapName}**`;
    setVetoLogs((prev) => [...prev, log]);
    setCurrentTurnTeam((prev) => (prev === team1Name ? team2Name : team1Name));
  };

  // Reset Veto
  const handleResetVeto = () => {
    setMapList(initialMaps.map((m) => ({ name: m, status: 'available' })));
    setVetoLogs([]);
    setCurrentTurnTeam(team1Name);
  };

  const copyVetoResult = () => {
    const lines = [
      `### 🗺️ KẾT QUẢ BAN / PICK MAP (${team1Name} 🆚 ${team2Name})`,
      ...vetoLogs,
    ];
    const pickedMaps = mapList.filter((m) => m.status === 'picked');
    if (pickedMaps.length > 0) {
      lines.push('', `🔥 **BẢN ĐỒ THI ĐẤU:** ${pickedMaps.map((m) => m.name).join(', ')}`);
    }
    navigator.clipboard.writeText(lines.join('\n'));
    setVetoCopied(true);
    setTimeout(() => setVetoCopied(false), 2000);
  };

  const coinWinner = coinResult
    ? team1Call === coinResult
      ? team1Name
      : team2Name
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="cointoss-modal"
        className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Công Cụ Trọng Tài: Tung Đồng Xu & Cấm Chọn Map
              </h3>
              <p className="text-xs text-slate-400">
                Hỗ trợ phân xử chọn bên (Side) và ban/pick map trực tiếp cho Discord Voice
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

        {/* Tool Sub Tabs */}
        <div className="flex items-center border-b border-white/10 bg-white/[0.02] px-6 py-2.5 gap-3 text-xs font-semibold">
          <button
            id="tab-tool-coin"
            onClick={() => setActiveTool('coin')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
              activeTool === 'coin'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <CircleDollarSign className="w-4 h-4 text-amber-300" /> Tung Đồng Xu (Coin Flip)
          </button>
          <button
            id="tab-tool-veto"
            onClick={() => setActiveTool('veto')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
              activeTool === 'veto'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Swords className="w-4 h-4 text-indigo-300" /> Cấm / Chọn Map (Map Veto)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* COIN FLIP TOOL */}
          {activeTool === 'coin' && (
            <div className="space-y-6">
              {/* Team selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-2">
                  <label className="block text-xs font-bold text-blue-400">
                    Đội 1 (Chọn mặt):
                  </label>
                  <input
                    type="text"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400">Chọn:</span>
                    <button
                      type="button"
                      onClick={() => setTeam1Call('HEADS')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        team1Call === 'HEADS'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Mặt Ngửa (HEADS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeam1Call('TAILS')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        team1Call === 'TAILS'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Mặt Sấp (TAILS)
                    </button>
                  </div>
                </div>

                <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-2">
                  <label className="block text-xs font-bold text-rose-400">
                    Đội 2:
                  </label>
                  <input
                    type="text"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                  <p className="text-xs text-slate-400 pt-1">
                    Sẽ nhận mặt còn lại:{' '}
                    <strong className="text-slate-200">
                      {team1Call === 'HEADS' ? 'Mặt Sấp (TAILS)' : 'Mặt Ngửa (HEADS)'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Coin Animation Stage */}
              <div className="flex flex-col items-center justify-center p-8 bg-white/[0.03] rounded-3xl border border-white/10 text-center">
                <div
                  className={`w-28 h-28 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all duration-700 backdrop-blur-md ${
                    isFlipping
                      ? 'animate-spin border-amber-400 bg-amber-500/20 scale-110 shadow-amber-500/40'
                      : coinResult === 'HEADS'
                      ? 'border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-black shadow-amber-500/50'
                      : coinResult === 'TAILS'
                      ? 'border-cyan-400 bg-gradient-to-tr from-cyan-600 to-blue-500 text-slate-950 font-black shadow-cyan-500/50'
                      : 'border-white/20 bg-white/5 text-slate-400'
                  }`}
                >
                  {isFlipping ? (
                    <Sparkles className="w-10 h-10 text-amber-300 animate-pulse" />
                  ) : coinResult === 'HEADS' ? (
                    <span className="text-xl font-black tracking-wider">NGỬA (H)</span>
                  ) : coinResult === 'TAILS' ? (
                    <span className="text-xl font-black tracking-wider">SẤP (T)</span>
                  ) : (
                    <CircleDollarSign className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                {/* Coin Result Announcement */}
                {coinWinner && !isFlipping && (
                  <div className="mt-5 p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/50 text-center animate-in zoom-in-95 backdrop-blur-md">
                    <span className="text-xs text-amber-400 uppercase font-bold tracking-wider">
                      Kết Quả Đồng Xu: {coinResult === 'HEADS' ? 'MẶT NGỬA (HEADS)' : 'MẶT SẤP (TAILS)'}
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-1">
                      🎉 <strong>{coinWinner}</strong> Thắng Tung Đồng Xu!
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Được quyền chọn <strong>Bên (Side)</strong> hoặc <strong>First Pick</strong>.
                    </p>
                  </div>
                )}

                <button
                  id="btn-trigger-coin-flip"
                  type="button"
                  disabled={isFlipping}
                  onClick={handleFlipCoin}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isFlipping ? 'Đang xoay đồng xu...' : 'Tung Đồng Xu Ngay!'}
                </button>
              </div>
            </div>
          )}

          {/* MAP VETO TOOL */}
          {activeTool === 'veto' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-white/[0.04] rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Lượt tiếp theo:</span>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-lg">
                    {currentTurnTeam}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetVeto}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Làm lại
                  </button>
                  {vetoLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={copyVetoResult}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-md shadow-indigo-600/30"
                    >
                      {vetoCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Kết Quả
                    </button>
                  )}
                </div>
              </div>

              {/* Maps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mapList.map((map) => {
                  const isBanned = map.status === 'banned';
                  const isPicked = map.status === 'picked';

                  return (
                    <div
                      key={map.name}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between backdrop-blur-md ${
                        isBanned
                          ? 'border-rose-900/50 bg-rose-950/20 opacity-50'
                          : isPicked
                          ? 'border-emerald-500/80 bg-emerald-950/50 ring-2 ring-emerald-500/40'
                          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-100">{map.name}</h4>
                          {isBanned ? (
                            <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
                              🚫 CẤM (Ban)
                            </span>
                          ) : isPicked ? (
                            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                              ✅ CHỌN (Pick)
                            </span>
                          ) : null}
                        </div>
                        {map.by && (
                          <p className="text-[11px] text-slate-400 mt-1">bởi {map.by}</p>
                        )}
                      </div>

                      {map.status === 'available' && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => handleBanMap(map.name)}
                            className="flex-1 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Cấm (Ban)
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePickMap(map.name)}
                            className="flex-1 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Chọn (Pick)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Veto Logs */}
              {vetoLogs.length > 0 && (
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-1 text-xs font-mono">
                  <span className="text-slate-300 font-bold block mb-1">
                    📜 Lịch sử Ban / Pick:
                  </span>
                  {vetoLogs.map((log, idx) => (
                    <p key={idx} className="text-slate-300">
                      {log.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-white/[0.03] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
