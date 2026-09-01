import React, { useState } from 'react';
import { BracketType, Participant, TournamentDivision } from '../types/tournament';
import { SAMPLE_SECT_DIVISIONS } from '../data/presets';
import { SectIcon } from './SectIcon';
import { SectIconPicker } from './SectIconPicker';
import {
  Plus,
  Trash2,
  Shuffle,
  Users,
  Swords,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  Shield,
  GripVertical,
} from 'lucide-react';

interface DivisionSetupTabProps {
  divisions: TournamentDivision[];
  onChangeDivisions: (newDivisions: TournamentDivision[]) => void;
  defaultFormat: BracketType;
}

const SECT_ICONS = [
  { icon: '🗡️', name: 'Toái Mộng' },
  { icon: '🛡️', name: 'Thiết Y' },
  { icon: '🚩', name: 'Huyết Hà' },
  { icon: '🔮', name: 'Cửu Linh' },
  { icon: '🪷', name: 'Tố Vấn' },
  { icon: '⚡', name: 'Long Ngâm' },
  { icon: '🏹', name: 'Huyền Cơ' },
  { icon: '🏆', name: 'Cúp Vàng' },
  { icon: '⭐', name: 'Ngôi Sao' },
];

export const DivisionSetupTab: React.FC<DivisionSetupTabProps> = ({
  divisions,
  onChangeDivisions,
  defaultFormat,
}) => {
  const [selectedDivIndex, setSelectedDivIndex] = useState<number>(0);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerDiscord, setNewPlayerDiscord] = useState<string>('');
  const [bulkInput, setBulkInput] = useState<string>('');

  const currentDiv = divisions[selectedDivIndex] || divisions[0];

  // 1-Click: Create 6 Sect Divisions for Nghich Thuy Han
  const handleApplySectPreset = () => {
    const sectDivs: TournamentDivision[] = SAMPLE_SECT_DIVISIONS.map((s) => ({
      id: `div-${s.sectKey}-${Date.now()}`,
      name: s.name,
      sectKey: s.sectKey,
      sectIcon: s.sectIcon,
      format: defaultFormat,
      participants: s.participants.map((p, idx) => ({
        id: `p-${s.sectKey}-${idx + 1}-${Date.now()}`,
        name: p.name,
        discordTag: p.discordTag,
        seed: idx + 1,
      })),
      rounds: [],
      status: 'draft',
    }));

    onChangeDivisions(sectDivs);
    setSelectedDivIndex(0);
  };

  // 1-Click: Create 4 Generic Groups (A, B, C, D)
  const handleApplyCustomGroups = (count: number = 4) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const customDivs: TournamentDivision[] = [];

    for (let i = 0; i < count; i++) {
      customDivs.push({
        id: `div-group-${letters[i].toLowerCase()}-${Date.now()}-${i}`,
        name: `Bảng Đấu ${letters[i]}`,
        sectIcon: '⚔️',
        format: defaultFormat,
        participants: [
          { id: `p-g${i}-1`, name: `Player 1 (${letters[i]})`, discordTag: `@player1_${letters[i]}`, seed: 1 },
          { id: `p-g${i}-2`, name: `Player 2 (${letters[i]})`, discordTag: `@player2_${letters[i]}`, seed: 2 },
          { id: `p-g${i}-3`, name: `Player 3 (${letters[i]})`, discordTag: `@player3_${letters[i]}`, seed: 3 },
          { id: `p-g${i}-4`, name: `Player 4 (${letters[i]})`, discordTag: `@player4_${letters[i]}`, seed: 4 },
        ],
        rounds: [],
        status: 'draft',
      });
    }

    onChangeDivisions(customDivs);
    setSelectedDivIndex(0);
  };

  const handleAddDivision = () => {
    const nextIdx = divisions.length + 1;
    const newDiv: TournamentDivision = {
      id: `div-${Date.now()}`,
      name: `Bảng Đấu Mới #${nextIdx}`,
      sectIcon: '⚔️',
      format: defaultFormat,
      participants: [
        { id: `p-new-${Date.now()}-1`, name: `Player 1`, seed: 1 },
        { id: `p-new-${Date.now()}-2`, name: `Player 2`, seed: 2 },
      ],
      rounds: [],
      status: 'draft',
    };
    const updated = [...divisions, newDiv];
    onChangeDivisions(updated);
    setSelectedDivIndex(updated.length - 1);
  };

  const handleRemoveDivision = (indexToRemove: number) => {
    if (divisions.length <= 1) {
      alert('Giải đấu nhiều bảng phải giữ lại ít nhất 1 bảng đấu!');
      return;
    }
    const updated = divisions.filter((_, idx) => idx !== indexToRemove);
    onChangeDivisions(updated);
    setSelectedDivIndex(Math.max(0, indexToRemove - 1));
  };

  const handleUpdateCurrentDiv = (partial: Partial<TournamentDivision>) => {
    if (!currentDiv) return;
    const updated = [...divisions];
    updated[selectedDivIndex] = { ...currentDiv, ...partial };
    onChangeDivisions(updated);
  };

  // Participant handlers for current division
  const handleAddPlayer = () => {
    if (!newPlayerName.trim() || !currentDiv) return;
    const newP: Participant = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim(),
      discordTag: newPlayerDiscord.trim() || undefined,
      seed: currentDiv.participants.length + 1,
    };
    handleUpdateCurrentDiv({
      participants: [...currentDiv.participants, newP],
    });
    setNewPlayerName('');
    setNewPlayerDiscord('');
  };

  const handleRemovePlayer = (pId: string) => {
    if (!currentDiv) return;
    const updatedP = currentDiv.participants
      .filter((p) => p.id !== pId)
      .map((p, idx) => ({ ...p, seed: idx + 1 }));
    handleUpdateCurrentDiv({ participants: updatedP });
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (!currentDiv || draggedIndex === null || draggedIndex === targetIndex) return;
    const reordered = [...currentDiv.participants];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);
    const reseeded = reordered.map((p, idx) => ({ ...p, seed: idx + 1 }));
    handleUpdateCurrentDiv({ participants: reseeded });
    setDraggedIndex(null);
  };

  const handleShuffleSeeds = () => {
    if (!currentDiv) return;
    const shuffled = [...currentDiv.participants].sort(() => Math.random() - 0.5);
    const reseeded = shuffled.map((p, idx) => ({ ...p, seed: idx + 1 }));
    handleUpdateCurrentDiv({ participants: reseeded });
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim() || !currentDiv) return;
    const lines = bulkInput.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const parsed: Participant[] = lines.map((line, idx) => {
      let name = line;
      let discordTag = '';

      if (line.includes('(') && line.includes(')')) {
        const parts = line.split('(');
        name = parts[0].trim();
        discordTag = parts[1].replace(')', '').trim();
      } else if (line.includes('@')) {
        const parts = line.split('@');
        name = parts[0].trim() || parts[1].trim();
        discordTag = `@${parts[1].trim()}`;
      }

      return {
        id: `p-div-${Date.now()}-${idx}`,
        name: name || `Đấu thủ ${idx + 1}`,
        discordTag: discordTag || undefined,
        seed: idx + 1,
      };
    });

    handleUpdateCurrentDiv({ participants: parsed });
    setBulkInput('');
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Quick Presets Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/50 border border-amber-500/30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Mẫu Phân Bảng Tự Động (Multi-Division Presets)
              </h4>
              <p className="text-xs text-slate-300">
                Tạo nhanh nhiều bảng đấu cho từng Lưu Phái Nghịch Thủy Hàn hoặc phân chia bảng A, B, C, D
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApplySectPreset}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-black rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
            >
              <Swords className="w-4 h-4" />
              <span>⚡ Tạo 6 Bảng Lưu Phái Nghịch Thủy Hàn</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyCustomGroups(4)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Chia 4 Bảng (A, B, C, D)
            </button>
          </div>
        </div>
      </div>

      {/* Division Navigation Tabs & Add Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Danh sách các Bảng Đấu ({divisions.length} Bảng):
          </label>
          <button
            type="button"
            onClick={handleAddDivision}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Bảng Đấu</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {divisions.map((div, idx) => {
            const isSelected = idx === selectedDivIndex;
            return (
              <div
                key={div.id}
                onClick={() => setSelectedDivIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                <SectIcon icon={div.sectIcon || '⚔️'} name={div.name} size="sm" />
                <span>{div.name}</span>
                <span className="text-[10px] opacity-80 font-mono">
                  ({div.participants?.length || 0})
                </span>
                {divisions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDivision(idx);
                    }}
                    className="p-0.5 hover:bg-rose-500/30 rounded text-rose-300 ml-1 transition-colors"
                    title="Xóa bảng này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Division Configuration Card */}
      {currentDiv && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Division Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tên Bảng Đấu:
              </label>
              <input
                type="text"
                value={currentDiv.name}
                onChange={(e) => handleUpdateCurrentDiv({ name: e.target.value })}
                placeholder="VD: Bảng Đấu Toái Mộng hoặc Bảng A..."
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Icon / Sect Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Biểu Tượng / Phái:
              </label>
              <div className="flex items-center gap-2">
                <SectIconPicker
                  value={currentDiv.sectIcon || '⚔️'}
                  onChange={(icon, nameHint) => {
                    handleUpdateCurrentDiv({
                      sectIcon: icon,
                      ...(nameHint && currentDiv.name.startsWith('Bảng Đấu') ? { name: `Bảng Đấu ${nameHint}` } : {}),
                    });
                  }}
                  sectName={currentDiv.name}
                />
                <span className="text-xs text-slate-400">Chọn Icon HD hoặc Biểu tượng</span>
              </div>
            </div>

            {/* Format for this division */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Thể thức bảng đấu này:
              </label>
              <select
                value={currentDiv.format || defaultFormat}
                onChange={(e) =>
                  handleUpdateCurrentDiv({ format: e.target.value as BracketType })
                }
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-400"
              >
                <option value="single_elimination">Loại trực tiếp (Single Elimination)</option>
                <option value="double_elimination">Nhánh thắng/thua (Double Elimination)</option>
                <option value="round_robin">Vòng tròn tính điểm (Round Robin)</option>
              </select>
            </div>
          </div>

          {/* Participants for this division */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>
                  Danh sách đấu thủ <strong>{currentDiv.name}</strong> ({currentDiv.participants.length} người):
                </span>
              </div>

              <button
                type="button"
                onClick={handleShuffleSeeds}
                className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg flex items-center gap-1 transition-colors border border-white/10"
              >
                <Shuffle className="w-3.5 h-3.5 text-indigo-400" /> Xáo trộn hạt giống
              </button>
            </div>

            {/* Quick Add Player */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder={`Tên đấu thủ (VD: Judas)...`}
                className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <input
                type="text"
                value={newPlayerDiscord}
                onChange={(e) => setNewPlayerDiscord(e.target.value)}
                placeholder="Discord Tag (@user#1234)..."
                className="w-full sm:w-48 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm vào bảng
              </button>
            </div>

            {/* Bulk Paste Area for this division */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10 space-y-2">
              <label className="block text-[11px] font-bold text-slate-300">
                📋 Dán nhanh danh sách người chơi cho bảng này (Mỗi dòng 1 người):
              </label>
              <textarea
                rows={2}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={`Judas (@judas#8888)\nSlay.KiemMa (@kiem_ma#1234)\nDoatMenh_TM (@doatmenh#4321)`}
                className="w-full bg-slate-900/90 border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
              >
                Áp dụng danh sách dán vào bảng này
              </button>
            </div>

            {/* Participants Grid / List for this division with Drag & Drop */}
            <div className="space-y-1">
              {currentDiv.participants.length > 1 && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
                  <span className="flex items-center gap-1">
                    <GripVertical className="w-3 h-3 text-indigo-400" /> Kéo thả thẻ để đổi hạt giống
                  </span>
                  <span>{currentDiv.participants.length} người</span>
                </div>
              )}

              <div className="max-h-48 overflow-y-auto custom-scrollbar divide-y divide-white/5 bg-slate-950/80 rounded-xl border border-white/10">
                {currentDiv.participants.map((p, pIdx) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => handleDragStart(pIdx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(pIdx)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`flex items-center justify-between px-3 py-2 text-xs transition-all cursor-grab active:cursor-grabbing ${
                      draggedIndex === pIdx
                        ? 'opacity-40 bg-indigo-950/60 ring-1 ring-indigo-500'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 shrink-0" />
                      <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        #{p.seed || pIdx + 1}
                      </span>
                      <span className="font-bold text-slate-100 truncate">{p.name}</span>
                      {p.discordTag && (
                        <span className="text-[11px] text-slate-400 font-mono truncate">
                          {p.discordTag}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(p.id)}
                      className="p-1 hover:bg-rose-500/20 rounded text-rose-400 transition-colors"
                      title="Xóa khỏi bảng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
