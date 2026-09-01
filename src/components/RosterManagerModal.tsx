import React, { useState } from 'react';
import { Tournament, Participant } from '../types/tournament';
import {
  X,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  UserPlus,
  Eye,
  Lock,
  FileText,
  Shuffle,
  Sparkles,
  Save,
  GripVertical,
} from 'lucide-react';

interface RosterManagerModalProps {
  tournament: Tournament;
  isAdmin?: boolean;
  onOpenLogin?: () => void;
  onClose: () => void;
  onUpdateParticipants: (updatedParticipants: Participant[]) => void;
}

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  tournament,
  isAdmin = false,
  onOpenLogin,
  onClose,
  onUpdateParticipants,
}) => {
  const [participants, setParticipants] = useState<Participant[]>(tournament.participants || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'bulk'>('list');

  // Edit fields
  const [editName, setEditName] = useState<string>('');
  const [editDiscord, setEditDiscord] = useState<string>('');
  const [editMembers, setEditMembers] = useState<string>('');

  // Add new single field
  const [newName, setNewName] = useState<string>('');
  const [newDiscord, setNewDiscord] = useState<string>('');

  // Bulk input field
  const [bulkText, setBulkText] = useState<string>('');

  const handleStartEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDiscord(p.discordTag || '');
    setEditMembers(p.members ? p.members.join(', ') : '');
  };

  const handleSaveEdit = (id: string) => {
    const updated = participants.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          name: editName.trim() || p.name,
          discordTag: editDiscord.trim() || undefined,
          members: editMembers
            ? editMembers.split(',').map((m) => m.trim()).filter(Boolean)
            : undefined,
        };
      }
      return p;
    });
    setParticipants(updated);
    setEditingId(null);
  };

  const handleAddParticipant = () => {
    if (!newName.trim()) return;
    const newP: Participant = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newName.trim(),
      discordTag: newDiscord.trim() || undefined,
      seed: participants.length + 1,
    };
    setParticipants([...participants, newP]);
    setNewName('');
    setNewDiscord('');
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const parsed: Participant[] = lines.map((line, idx) => {
      // Check format: "Team Name | @discordTag" or "Team Name - @discordTag"
      let name = line;
      let discordTag: string | undefined = undefined;

      if (line.includes('|')) {
        const parts = line.split('|');
        name = parts[0].trim();
        discordTag = parts[1].trim();
      } else if (line.includes(' - ')) {
        const parts = line.split(' - ');
        name = parts[0].trim();
        discordTag = parts[1].trim();
      }

      return {
        id: `p-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        name,
        discordTag: discordTag && discordTag.startsWith('@') ? discordTag : discordTag ? `@${discordTag}` : undefined,
        seed: idx + 1,
      };
    });

    setParticipants(parsed);
    setBulkText('');
    setActiveTab('list');
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const reordered = [...participants];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);
    const reseeded = reordered.map((p, idx) => ({ ...p, seed: idx + 1 }));
    setParticipants(reseeded);
    setDraggedIndex(null);
  };

  const handleShuffle = () => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const reseeded = shuffled.map((p, idx) => ({ ...p, seed: idx + 1 }));
    setParticipants(reseeded);
  };

  const handleRemove = (id: string) => {
    const updated = participants.filter((p) => p.id !== id).map((p, idx) => ({ ...p, seed: idx + 1 }));
    setParticipants(updated);
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ danh sách tuyển thủ không?')) {
      setParticipants([]);
    }
  };

  const handleSaveAll = () => {
    if (participants.length < 2) {
      alert('Vui lòng có ít nhất 2 đội / người chơi trong bảng đấu!');
      return;
    }
    onUpdateParticipants(participants);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="roster-manager-modal"
        className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Quản Lý & Chỉnh Sửa Player / Team ({participants.length})
                {!isAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Chỉ xem
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Nhập trực tiếp tên đấu thủ, Discord tag và tự động cập nhật vào sơ đồ nhánh đấu'
                  : 'Xem danh sách các đội tuyển, Discord tag và thành viên tham gia'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher for Admin: Nhập từng người vs Nhập hàng loạt */}
        {isAdmin && (
          <div className="px-6 pt-3 bg-slate-950/30 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                  activeTab === 'list'
                    ? 'text-indigo-400 border-indigo-500 bg-slate-900'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                Danh Sách Tuyển Thủ ({participants.length})
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'bulk'
                    ? 'text-indigo-400 border-indigo-500 bg-slate-900'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Nhập Nhanh Hàng Loạt
              </button>
            </div>

            {activeTab === 'list' && participants.length > 1 && (
              <div className="flex items-center gap-2 pb-1.5">
                <button
                  onClick={handleShuffle}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-colors"
                  title="Xáo trộn vị trí hạt giống ngẫu nhiên"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Xáo Trộn
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/20 transition-colors"
                >
                  Xóa Hết
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {activeTab === 'bulk' && isAdmin ? (
            /* Bulk Import Form */
            <div className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl text-xs text-indigo-200 space-y-1.5 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-indigo-300">
                  <Sparkles className="w-4 h-4" /> Hướng dẫn nhập nhanh danh sách tuyển thủ:
                </p>
                <p>Mỗi dòng là một Player / Team. Bạn có thể kèm theo Discord Tag bằng dấu gạch đứng <code className="bg-indigo-900/60 px-1 py-0.5 rounded font-mono">|</code> hoặc <code className="bg-indigo-900/60 px-1 py-0.5 rounded font-mono">-</code></p>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                  Toái Mộng Thần Kiếm | @toaimong1<br />
                  Thiết Y Bất Bại | @thiety_cap<br />
                  Huyết Hà Thương Vương | @huyetha_top1<br />
                  Cửu Linh U Hồn | @cuulinh_master
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Dán danh sách vào đây (mỗi dòng 1 người):
                </label>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Dán danh sách người chơi tại đây..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-2xl p-4 text-xs sm:text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Check className="w-4 h-4" /> Áp Dụng Danh Sách Này
              </button>
            </div>
          ) : (
            /* List Form */
            <div className="space-y-4">
              {/* Quick Add Bar for Admin */}
              {isAdmin && (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-wrap sm:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
                    placeholder="Tên Player / Team mới..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={newDiscord}
                    onChange={(e) => setNewDiscord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
                    placeholder="Discord Tag (@player)..."
                    className="w-full sm:w-48 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={handleAddParticipant}
                    disabled={!newName.trim()}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
              )}

              {/* Empty State */}
              {participants.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
                  <Users className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">Chưa có tuyển thủ nào trong bảng đấu này.</p>
                  {isAdmin && (
                    <p className="text-[11px] text-indigo-400">Hãy thêm tuyển thủ ở ô trên hoặc bấm "Nhập Nhanh Hàng Loạt".</p>
                  )}
                </div>
              ) : (
                /* Participant Cards with Drag & Drop */
                <div className="space-y-2.5">
                  {isAdmin && participants.length > 1 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
                      <span className="flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 text-indigo-400" /> Kéo thả thẻ để hoán đổi vị trí hạt giống (Seed)
                      </span>
                      <span>{participants.length} tuyển thủ</span>
                    </div>
                  )}

                  {participants.map((p, idx) => {
                    const isEditing = editingId === p.id;

                    return (
                      <div
                        key={p.id}
                        draggable={isAdmin && !isEditing}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`bg-slate-950/60 border rounded-2xl p-3.5 transition-all ${
                          draggedIndex === idx
                            ? 'opacity-40 bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500'
                            : 'border-slate-800 hover:border-slate-700'
                        } ${isAdmin && !isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      >
                        {isEditing && isAdmin ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                  Tên Player / Team:
                                </label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                  Discord Tag:
                                </label>
                                <input
                                  type="text"
                                  value={editDiscord}
                                  onChange={(e) => setEditDiscord(e.target.value)}
                                  placeholder="@tag"
                                  className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleSaveEdit(p.id)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Lưu Tạm
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {isAdmin && (
                                <GripVertical className="w-4 h-4 text-slate-500 hover:text-slate-300 shrink-0" />
                              )}
                              <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-indigo-400 flex items-center justify-center shrink-0">
                                #{p.seed}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs sm:text-sm text-white truncate">{p.name}</h4>
                                  {p.discordTag && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#8ea1ff] text-[10px] font-mono shrink-0">
                                      {p.discordTag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isAdmin && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleStartEdit(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-900 transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemove(p.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Tổng cộng: <strong className="text-white">{participants.length}</strong> tuyển thủ
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
            {isAdmin && (
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" /> Lưu & Cập Nhật Nhánh Đấu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
