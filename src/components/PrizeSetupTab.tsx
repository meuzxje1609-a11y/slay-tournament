import React, { useState } from 'react';
import { GameCategory } from '../types/tournament';
import {
  Banknote,
  Coins,
  Crown,
  Gift,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Gamepad2,
} from 'lucide-react';

export interface PrizeSetupTabProps {
  game: GameCategory;

  // 1. Tiền mặt (Cash)
  cashEnabled: boolean;
  setCashEnabled: (v: boolean) => void;
  cashTotal: string;
  setCashTotal: (v: string) => void;
  cashChampion: string;
  setCashChampion: (v: string) => void;
  cashRunnerUp: string;
  setCashRunnerUp: (v: string) => void;
  cashThirdPlace: string;
  setCashThirdPlace: (v: string) => void;
  cashMVP: string;
  setCashMVP: (v: string) => void;
  cashPaymentMethod: string;
  setCashPaymentMethod: (v: string) => void;

  // 2. Tiền In-Game
  inGameEnabled: boolean;
  setInGameEnabled: (v: boolean) => void;
  inGameCurrencyName: string;
  setInGameCurrencyName: (v: string) => void;
  inGameTotal: string;
  setInGameTotal: (v: string) => void;
  inGameChampion: string;
  setInGameChampion: (v: string) => void;
  inGameRunnerUp: string;
  setInGameRunnerUp: (v: string) => void;
  inGameThirdPlace: string;
  setInGameThirdPlace: (v: string) => void;
  inGameMVP: string;
  setInGameMVP: (v: string) => void;

  // 3. Role Server
  rolesEnabled: boolean;
  setRolesEnabled: (v: boolean) => void;
  rolesChampion: string;
  setRolesChampion: (v: string) => void;
  rolesRunnerUp: string;
  setRolesRunnerUp: (v: string) => void;
  rolesThirdPlace: string;
  setRolesThirdPlace: (v: string) => void;
  rolesParticipant: string;
  setRolesParticipant: (v: string) => void;
  rolesMVP: string;
  setRolesMVP: (v: string) => void;
  rolesPerks: string;
  setRolesPerks: (v: string) => void;

  // 4. Khác
  otherEnabled: boolean;
  setOtherEnabled: (v: boolean) => void;
  otherItems: string[];
  setOtherItems: (v: string[]) => void;
  sponsorName: string;
  setSponsorName: (v: string) => void;
  customNotes: string;
  setCustomNotes: (v: string) => void;
}

export const PrizeSetupTab: React.FC<PrizeSetupTabProps> = ({
  game,
  cashEnabled,
  setCashEnabled,
  cashTotal,
  setCashTotal,
  cashChampion,
  setCashChampion,
  cashRunnerUp,
  setCashRunnerUp,
  cashThirdPlace,
  setCashThirdPlace,
  cashMVP,
  setCashMVP,
  cashPaymentMethod,
  setCashPaymentMethod,
  inGameEnabled,
  setInGameEnabled,
  inGameCurrencyName,
  setInGameCurrencyName,
  inGameTotal,
  setInGameTotal,
  inGameChampion,
  setInGameChampion,
  inGameRunnerUp,
  setInGameRunnerUp,
  inGameThirdPlace,
  setInGameThirdPlace,
  inGameMVP,
  setInGameMVP,
  rolesEnabled,
  setRolesEnabled,
  rolesChampion,
  setRolesChampion,
  rolesRunnerUp,
  setRolesRunnerUp,
  rolesThirdPlace,
  setRolesThirdPlace,
  rolesParticipant,
  setRolesParticipant,
  rolesMVP,
  setRolesMVP,
  rolesPerks,
  setRolesPerks,
  otherEnabled,
  setOtherEnabled,
  otherItems,
  setOtherItems,
  sponsorName,
  setSponsorName,
  customNotes,
  setCustomNotes,
}) => {
  const [newOtherItem, setNewOtherItem] = useState<string>('');

  const handleAddOtherItem = () => {
    if (!newOtherItem.trim()) return;
    setOtherItems([...otherItems, newOtherItem.trim()]);
    setNewOtherItem('');
  };

  const handleRemoveOtherItem = (index: number) => {
    setOtherItems(otherItems.filter((_, idx) => idx !== index));
  };

  const applyCashPreset = (total: string, champ: string, runner: string, third: string, mvp: string) => {
    setCashTotal(total);
    setCashChampion(champ);
    setCashRunnerUp(runner);
    setCashThirdPlace(third);
    setCashMVP(mvp);
  };

  const applyInGamePreset = (currency: string, total: string, champ: string, runner: string, third: string, mvp: string) => {
    setInGameCurrencyName(currency);
    setInGameTotal(total);
    setInGameChampion(champ);
    setInGameRunnerUp(runner);
    setInGameThirdPlace(third);
    setInGameMVP(mvp);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/20 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Thiết Lập Cơ Cấu Giải Thưởng & Quyền Lợi Discord
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Tùy biến 4 hạng mục phần thưởng riêng biệt: Tiền mặt, Tiền In-Game, ROLE Server Discord và Các phần quà tặng khác.
          </p>
        </div>
      </div>

      {/* 4 HẠNG MỤC PHẦN THƯỞNG */}
      <div className="space-y-5">
        {/* ================= 1. TIỀN MẶT ================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          cashEnabled
            ? 'bg-emerald-950/20 border-emerald-500/30 ring-1 ring-emerald-500/20'
            : 'bg-white/[0.02] border-white/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-emerald-300">
                  1. GIẢI THƯỞNG TIỀN MẶT (CASH PRIZE)
                </h5>
                <span className="text-[11px] text-slate-400">Chuyển khoản trực tiếp Banking / MoMo / ZaloPay</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cashEnabled}
                onChange={(e) => setCashEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {cashEnabled && (
            <div className="mt-4 space-y-3.5">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">⚡ Gợi ý mức giải:</span>
                <button
                  type="button"
                  onClick={() => applyCashPreset('500.000 VNĐ', '300.000 VNĐ', '150.000 VNĐ', '50.000 VNĐ', '50.000 VNĐ')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
                >
                  500k Mini
                </button>
                <button
                  type="button"
                  onClick={() => applyCashPreset('1.000.000 VNĐ', '600.000 VNĐ', '300.000 VNĐ', '100.000 VNĐ', '100.000 VNĐ')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
                >
                  1 Triệu Chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => applyCashPreset('2.000.000 VNĐ', '1.200.000 VNĐ', '500.000 VNĐ', '300.000 VNĐ', '200.000 VNĐ')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
                >
                  2 Triệu Major
                </button>
                <button
                  type="button"
                  onClick={() => applyCashPreset('5.000.000 VNĐ', '3.000.000 VNĐ', '1.200.000 VNĐ', '500.000 VNĐ', '300.000 VNĐ')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
                >
                  5 Triệu Siêu Cúp
                </button>
              </div>

              {/* Total & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    💰 Tổng giải thưởng Tiền Mặt:
                  </label>
                  <input
                    type="text"
                    value={cashTotal}
                    onChange={(e) => setCashTotal(e.target.value)}
                    placeholder="VD: 1.000.000 VNĐ"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    💳 Hình thức chi trả:
                  </label>
                  <input
                    type="text"
                    value={cashPaymentMethod}
                    onChange={(e) => setCashPaymentMethod(e.target.value)}
                    placeholder="VD: Chuyển khoản Banking / MoMo / ZaloPay"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Cash Distribution Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-amber-400">🥇 Quán Quân (Vô địch):</span>
                  <input
                    type="text"
                    value={cashChampion}
                    onChange={(e) => setCashChampion(e.target.value)}
                    placeholder="600.000 VNĐ"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-slate-300">🥈 Á Quân (Hạng 2):</span>
                  <input
                    type="text"
                    value={cashRunnerUp}
                    onChange={(e) => setCashRunnerUp(e.target.value)}
                    placeholder="300.000 VNĐ"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-amber-600">🥉 Hạng 3 (Quý quân):</span>
                  <input
                    type="text"
                    value={cashThirdPlace}
                    onChange={(e) => setCashThirdPlace(e.target.value)}
                    placeholder="100.000 VNĐ"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-indigo-400">⭐ Tuyển thủ MVP:</span>
                  <input
                    type="text"
                    value={cashMVP}
                    onChange={(e) => setCashMVP(e.target.value)}
                    placeholder="100.000 VNĐ"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. TIỀN IN-GAME ================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          inGameEnabled
            ? 'bg-cyan-950/20 border-cyan-500/30 ring-1 ring-cyan-500/20'
            : 'bg-white/[0.02] border-white/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-cyan-300">
                  2. GIẢI THƯỞNG TIỀN IN-GAME & VẬT PHẨM GAME
                </h5>
                <span className="text-[11px] text-slate-400">VP Valorant, RP Liên Minh, FC Point, Kim Cương, Coins, Skin...</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inGameEnabled}
                onChange={(e) => setInGameEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {inGameEnabled && (
            <div className="mt-4 space-y-3.5">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">🎮 Chọn nhanh bộ môn:</span>
                <button
                  type="button"
                  onClick={() => applyInGamePreset('VP (Valorant Points)', '11.500 VP', '5.500 VP', '3.500 VP', '1.500 VP', '1.000 VP')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 transition-colors"
                >
                  🎯 Valorant Points (VP)
                </button>
                <button
                  type="button"
                  onClick={() => applyInGamePreset('RP (Liên Minh Huyền Thoại)', '5.000 RP', '2.500 RP', '1.500 RP', '600 RP', '400 RP')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 transition-colors"
                >
                  ⚔️ LMHT RP
                </button>
                <button
                  type="button"
                  onClick={() => applyInGamePreset('Kim Cương / Quân Huy', '3.000 Kim Cương', '1.500 KC', '900 KC', '400 KC', '200 KC')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 transition-colors"
                >
                  💎 Kim Cương / Quân Huy
                </button>
                <button
                  type="button"
                  onClick={() => applyInGamePreset('Steam Wallet Code', '$50 Steam Code', '$25 Code', '$15 Code', '$10 Code', '$5 Code')}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 transition-colors"
                >
                  🎁 Steam Wallet
                </button>
              </div>

              {/* Currency & Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    🏷️ Đơn vị tiền tệ / Vật phẩm In-Game:
                  </label>
                  <input
                    type="text"
                    value={inGameCurrencyName}
                    onChange={(e) => setInGameCurrencyName(e.target.value)}
                    placeholder="VD: VP (Valorant Point), RP, Kim Cương..."
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ✨ Tổng phần thưởng In-Game:
                  </label>
                  <input
                    type="text"
                    value={inGameTotal}
                    onChange={(e) => setInGameTotal(e.target.value)}
                    placeholder="VD: 11.500 VP hoặc 5.000 RP..."
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-amber-400">🥇 Quán Quân:</span>
                  <input
                    type="text"
                    value={inGameChampion}
                    onChange={(e) => setInGameChampion(e.target.value)}
                    placeholder="5.500 VP"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-slate-300">🥈 Á Quân:</span>
                  <input
                    type="text"
                    value={inGameRunnerUp}
                    onChange={(e) => setInGameRunnerUp(e.target.value)}
                    placeholder="3.500 VP"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-amber-600">🥉 Hạng 3:</span>
                  <input
                    type="text"
                    value={inGameThirdPlace}
                    onChange={(e) => setInGameThirdPlace(e.target.value)}
                    placeholder="1.500 VP"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                  <span className="block text-[10px] font-bold text-cyan-400">⭐ MVP / Ace:</span>
                  <input
                    type="text"
                    value={inGameMVP}
                    onChange={(e) => setInGameMVP(e.target.value)}
                    placeholder="1.000 VP"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. ROLE SERVER DISCORD ================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          rolesEnabled
            ? 'bg-purple-950/20 border-purple-500/30 ring-1 ring-purple-500/20'
            : 'bg-white/[0.02] border-white/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-purple-300">
                  3. ROLE SERVER (DANH HIỆU & QUYỀN HẠN DISCORD)
                </h5>
                <span className="text-[11px] text-slate-400">Gán Role vinh danh độc quyền trên Discord Server</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rolesEnabled}
                onChange={(e) => setRolesEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {rolesEnabled && (
            <div className="mt-4 space-y-3.5">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">👑 Mẫu Role nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setRolesChampion('👑 Slay Champion 2026');
                    setRolesRunnerUp('🥈 Á Quân Slay Cup');
                    setRolesThirdPlace('🥉 Hạng 3 Slay Cup');
                    setRolesParticipant('🎖️ Slay Fighter');
                    setRolesMVP('⭐ Tournament MVP');
                  }}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 transition-colors"
                >
                  Chuẩn Slay Server
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRolesChampion('🏆 Vô Địch Esports');
                    setRolesRunnerUp('🥈 Á Quân Esports');
                    setRolesThirdPlace('🥉 Top 3 Esports');
                    setRolesParticipant('🎮 Vận Động Viên');
                    setRolesMVP('🔥 Chiến Thần MVP');
                  }}
                  className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 transition-colors"
                >
                  Esports Master
                </button>
              </div>

              {/* 5 Specific Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">
                    👑 Role Quán Quân (Vô địch):
                  </label>
                  <input
                    type="text"
                    value={rolesChampion}
                    onChange={(e) => setRolesChampion(e.target.value)}
                    placeholder="VD: 👑 Slay Champion 2026"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    🥈 Role Á Quân:
                  </label>
                  <input
                    type="text"
                    value={rolesRunnerUp}
                    onChange={(e) => setRolesRunnerUp(e.target.value)}
                    placeholder="VD: 🥈 Á Quân Slay"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-600 mb-1">
                    🥉 Role Hạng 3:
                  </label>
                  <input
                    type="text"
                    value={rolesThirdPlace}
                    onChange={(e) => setRolesThirdPlace(e.target.value)}
                    placeholder="VD: 🥉 Hạng 3 Slay"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-amber-600 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 mb-1">
                    ⭐ Role Tuyển thủ MVP:
                  </label>
                  <input
                    type="text"
                    value={rolesMVP}
                    onChange={(e) => setRolesMVP(e.target.value)}
                    placeholder="VD: ⭐ MVP Slay Tournament"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-indigo-300 mb-1">
                    🎖️ Role Toàn bộ tuyển thủ tham gia:
                  </label>
                  <input
                    type="text"
                    value={rolesParticipant}
                    onChange={(e) => setRolesParticipant(e.target.value)}
                    placeholder="VD: 🎖️ Slay Fighter"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-indigo-200 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ✨ Quyền lợi & Đặc quyền Server kèm theo:
                </label>
                <input
                  type="text"
                  value={rolesPerks}
                  onChange={(e) => setRolesPerks(e.target.value)}
                  placeholder="VD: Huy hiệu Icon Server, Voice VIP Room, Tên màu sáng trên danh sách online..."
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= 4. CÁC PHẦN THƯỞNG KHÁC ================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          otherEnabled
            ? 'bg-amber-950/20 border-amber-500/30 ring-1 ring-amber-500/20'
            : 'bg-white/[0.02] border-white/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-amber-300">
                  4. CÁC PHẦN THƯỞNG KHÁC (GIFTS & SPONSOR REWARDS)
                </h5>
                <span className="text-[11px] text-slate-400">Discord Nitro, Cúp vinh danh, Áo đấu, Voucher nhà tài trợ...</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={otherEnabled}
                onChange={(e) => setOtherEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {otherEnabled && (
            <div className="mt-4 space-y-3.5">
              {/* Quick Tag Templates */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">🎁 Thêm nhanh quà tặng:</span>
                {[
                  '1 Tháng Discord Nitro Cho MVP',
                  'Kỷ niệm chương / Cúp vinh danh Server Slay',
                  'Áo thun đấu Slay độc quyền',
                  'Thẻ cào 100k cho giải Khán Giả May Mắn',
                  'Voucher ăn uống từ Nhà Tài Trợ',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (!otherItems.includes(item)) {
                        setOtherItems([...otherItems, item]);
                      }
                    }}
                    className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {item}
                  </button>
                ))}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300">
                  📋 Danh sách các phần thưởng khác ({otherItems.length}):
                </label>
                <div className="flex flex-wrap gap-2">
                  {otherItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2"
                    >
                      <span>🎁 {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherItem(idx)}
                        className="text-amber-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {otherItems.length === 0 && (
                    <span className="text-xs text-slate-500 italic">Chưa có phần thưởng bổ sung. Hãy thêm bên dưới hoặc chọn mẫu nhanh!</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newOtherItem}
                    onChange={(e) => setNewOtherItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOtherItem())}
                    placeholder="Nhập tên phần quà khác (VD: Áo đấu, Thẻ cào, Nitro...)"
                    className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddOtherItem}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Quà
                  </button>
                </div>
              </div>

              {/* Sponsor & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    🏢 Nhà tài trợ / Đơn vị trao thưởng:
                  </label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="VD: Ban Quản Trị Server Slay & Mạnh Thường Quân"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    📌 Điều kiện & Ghi chú nhận thưởng:
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="VD: Trao giải trong vòng 24h sau trận Chung kết"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
