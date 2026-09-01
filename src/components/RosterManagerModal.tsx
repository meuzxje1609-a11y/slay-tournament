import React, { useState } from 'react';
import { Tournament, Participant } from '../types/tournament';
import { X, Users, Plus, Trash2, Edit2, Check, Shield, UserPlus, Eye, Lock } from 'lucide-react';

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
  const [participants, setParticipants] = useState<Participant[]>(tournament.participants);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState<string>('');
  const [editDiscord, setEditDiscord] = useState<string>('');
  const [editMembers, setEditMembers] = useState<string>('');

  // Add new field
  const [newName, setNewName] = useState<string>('');
  const [newDiscord, setNewDiscord] = useState<string>('');

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
      id: `p-${Date.now()}`,
      name: newName.trim(),
      discordTag: newDiscord.trim() || undefined,
      seed: participants.length + 1,
    };
    setParticipants([...participants, newP]);
    setNewName('');
    setNewDiscord('');
  };

  const handleRemove = (id: string) => {
    const updated = participants.filter((p) => p.id !== id).map((p, idx) => ({ ...p, seed: idx + 1 }));
    setParticipants(updated);
  };

  const handleSaveAll = () => {
    onUpdateParticipants(participants);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="roster-manager-modal"
        className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Danh Sách Tuyển Thủ / Roster ({participants.length})
                {!isAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Chỉ xem
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Chỉnh sửa Discord Tag, thành viên 5v5 & thứ hạng hạt giống (Seed)'
                  : 'Xem danh sách các đội tuyển, Discord tag và thành viên tham gia'}
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

        {/* Admin Quick Add Bar or Guest Banner */}
        {isAdmin ? (
          <div className="p-4 bg-white/[0.02] border-b border-white/10 flex flex-wrap sm:flex-nowrap gap-2 items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên đội / Player mới..."
              className="flex-1 bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <input
              type="text"
              value={newDiscord}
              onChange={(e) => setNewDiscord(e.target.value)}
              placeholder="Discord Tag (VD: @player#1234)..."
              className="w-full sm:w-48 bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleAddParticipant}
              disabled={!newName.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Thêm
            </button>
          </div>
        ) : (
          <div className="p-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" /> Chế độ xem danh sách đội tuyển.
            </span>
            {onOpenLogin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> Đăng nhập Admin
              </button>
            )}
          </div>
        )}

        {/* Participants List */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-3 flex-1">
          {participants.map((p) => {
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all"
              >
                {isEditing && isAdmin ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Tên đội / Tuyển thủ:
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Discord Mention Tag:
                        </label>
                        <input
                          type="text"
                          value={editDiscord}
                          onChange={(e) => setEditDiscord(e.target.value)}
                          placeholder="@tag"
                          className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Danh sách thành viên (cách nhau bởi dấu phẩy):
                      </label>
                      <input
                        type="text"
                        value={editMembers}
                        onChange={(e) => setEditMembers(e.target.value)}
                        placeholder="VD: Player1 (Cap), Player2, Player3, Player4, Player5"
                        className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
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
                        <Check className="w-3.5 h-3.5" /> Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 text-xs font-mono font-bold text-indigo-300 flex items-center justify-center shrink-0">
                        #{p.seed}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-100 truncate">{p.name}</h4>
                          {p.discordTag && (
                            <span className="px-2 py-0.5 rounded-md bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#8ea1ff] text-[11px] font-mono shrink-0">
                              {p.discordTag}
                            </span>
                          )}
                        </div>
                        {p.members && p.members.length > 0 && (
                          <p className="text-[11px] text-slate-400 mt-1 truncate">
                            👥 {p.members.join(' • ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-white/[0.03] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Đóng
          </button>
          {isAdmin && (
            <button
              id="btn-save-roster-changes"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" /> Cập Nhật Roster
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
