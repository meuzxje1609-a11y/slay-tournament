import React, { useState } from 'react';
import { ThatTuyetMaster } from '../types/thatTuyetBang';
import { SectIcon } from './SectIcon';
import { SectIconPicker } from './SectIconPicker';
import {
  X,
  Crown,
  Sparkles,
  Share2,
  Copy,
  Check,
  Edit3,
  Save,
  RotateCcw,
  Award,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';

const TUYET_RANKS = [
  'Nhất Tuyệt',
  'Nhị Tuyệt',
  'Tam Tuyệt',
  'Tứ Tuyệt',
  'Ngũ Tuyệt',
  'Lục Tuyệt',
  'Thất Tuyệt',
  'Bát Tuyệt',
  'Cửu Tuyệt',
  'Thập Tuyệt',
];

const SECT_COLOR_PALETTES = [
  {
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    gradient: 'from-rose-600 via-pink-600 to-rose-700',
  },
  {
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-600 via-orange-600 to-yellow-600',
  },
  {
    bg: 'bg-red-950/40',
    border: 'border-red-500/40',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    gradient: 'from-red-600 via-rose-700 to-red-800',
  },
  {
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/40',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    gradient: 'from-purple-600 via-indigo-600 to-violet-700',
  },
  {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    gradient: 'from-emerald-600 via-teal-600 to-green-700',
  },
  {
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/40',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    gradient: 'from-cyan-600 via-blue-600 to-sky-700',
  },
];

interface ThatTuyetBangModalProps {
  isOpen: boolean;
  onClose: () => void;
  masters: ThatTuyetMaster[];
  onUpdateMasters: (newMasters: ThatTuyetMaster[]) => void;
  isAdmin: boolean;
}

export const ThatTuyetBangModal: React.FC<ThatTuyetBangModalProps> = ({
  isOpen,
  onClose,
  masters,
  onUpdateMasters,
  isAdmin,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedMasters, setEditedMasters] = useState<ThatTuyetMaster[]>(masters);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedSectId, setSelectedSectId] = useState<string>(masters[0]?.id || 'sect-1');

  if (!isOpen) return null;

  const handleFieldChange = (id: string, field: keyof ThatTuyetMaster, value: string) => {
    setEditedMasters((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleAddNewMaster = () => {
    const nextIdx = editedMasters.length;
    const defaultRank = TUYET_RANKS[nextIdx] || `Tuyệt Thứ ${nextIdx + 1}`;
    const palette = SECT_COLOR_PALETTES[nextIdx % SECT_COLOR_PALETTES.length];
    const newMaster: ThatTuyetMaster = {
      id: `master-${Date.now()}`,
      sectKey: `custom_${Date.now()}`,
      sectName: 'Lưu Phái Mới',
      tuyetRank: defaultRank,
      sectTitle: 'Đỉnh Phong',
      sectRole: 'Tuyệt Thế Cao Thủ',
      sectIcon: '⚔️',
      sectColor: palette,
      playerName: `Cao Thủ ${nextIdx + 1}`,
      discordTag: `@user_${nextIdx + 1}`,
      serverRank: `Top 1 Phái`,
      winRate: '100%',
      roleReward: `@Đệ Nhất`,
    };
    setEditedMasters((prev) => [...prev, newMaster]);
  };

  const handleDeleteMaster = (id: string) => {
    if (editedMasters.length <= 1) {
      alert('Thất Tuyệt Bảng phải có ít nhất 1 người chơi!');
      return;
    }
    setEditedMasters((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    onUpdateMasters(editedMasters);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedMasters(masters);
    setIsEditing(false);
  };

  const getDiscordIcon = (icon: string, sectName: string) => {
    if (icon.includes('toai_mong') || sectName.includes('Toái Mộng')) return '🗡️';
    if (icon.includes('thiet_y') || sectName.includes('Thiết Y')) return '🛡️';
    if (icon.includes('huyet_ha') || sectName.includes('Huyết Hà')) return '🚩';
    if (icon.includes('cuu_linh') || sectName.includes('Cửu Linh')) return '🔮';
    if (icon.includes('to_van') || sectName.includes('Tố Vấn')) return '🪷';
    if (icon.includes('long_ngam') || sectName.includes('Long Ngâm')) return '⚡';
    if (icon.includes('than_tuong') || sectName.includes('Thần Tướng')) return '🏹';
    if (icon.startsWith('/') || icon.startsWith('http')) return '⚔️';
    return icon || '⚔️';
  };

  // Generate Discord Markdown message (ĐÃ LOẠI BỎ vũ khí, tuyệt kỹ, câu hook theo yêu cầu)
  const generateDiscordMarkdown = () => {
    const currentList = isEditing ? editedMasters : masters;
    const lines = [
      `# ⚔️ THẤT TUYỆT BẢNG — TỈ VÕ LƯU PHÁI NGHỊCH THỦY HÀN ⚔️`,
      `> 🏆 **VINH DANH CÁC CAO THỦ TOP 1 TẠI CÁC ĐẠI LƯU PHÁI**`,
      `> 🏛️ **Server Discord:** Slay Gaming Community`,
      `> 📅 **Cập nhật:** ${new Date().toLocaleDateString('vi-VN')}`,
      '',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...currentList.map((m, idx) => {
        const tuyetTitle = m.tuyetRank || `Tuyệt Thứ ${idx + 1}`;
        const icon = getDiscordIcon(m.sectIcon, m.sectName);
        return [
          `### ${icon} ${tuyetTitle} ${m.playerName}`,
          `> 👑 **Cao Thủ:** **${m.playerName}** (\`${m.discordTag}\`)`,
          `> 🥋 **Lưu Phái:** **${m.sectName}**`,
          '',
        ].join('\n');
      }),
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👑 *Xin chúc mừng các vị Tông Chủ đã bước lên đỉnh vinh quang Thất Tuyệt Bảng!*`,
    ];
    return lines.join('\n');
  };

  const handleCopyDiscordMarkdown = () => {
    const text = generateDiscordMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentMasters = isEditing ? editedMasters : masters;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-b border-amber-500/30 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-amber-300 tracking-wider uppercase truncate">
                  THẤT TUYỆT BẢNG • NGHỊCH THỦY HÀN
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  {currentMasters.length} Tuyệt
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                Vinh danh các Cao Thủ Top 1 Trấn Thủ Các Đại Lưu Phái • Slay Championship
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleAddNewMaster}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Người</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Hủy</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chỉnh Sửa</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleCopyDiscordMarkdown}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md shadow-[#5865F2]/25'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Copy Discord'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Intro Ribbon */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Bảng Vàng Danh Dự:</strong> Vinh danh các vị Tông Chủ đạt ngôi vị Đỉnh Phong tại các Lưu Phái.
              </span>
            </div>
            <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              👑 Tuyệt Thế Cao Thủ Đỉnh Phong
            </span>
          </div>

          {/* Sects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMasters.map((m, idx) => {
              const isSelected = m.id === selectedSectId;
              const rankLabel = m.tuyetRank || `Tuyệt #${idx + 1}`;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedSectId(m.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    m.sectColor.bg
                  } ${
                    isSelected
                      ? `${m.sectColor.border} ring-2 ring-amber-400/50 shadow-xl scale-[1.01]`
                      : 'border-white/10 hover:border-white/20 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Sect Header */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <SectIconPicker
                            value={m.sectIcon}
                            onChange={(newIcon, sectHint) => {
                              handleFieldChange(m.id, 'sectIcon', newIcon);
                              if (sectHint && (!m.sectName || m.sectName === 'Lưu Phái Mới')) {
                                handleFieldChange(m.id, 'sectName', sectHint);
                              }
                            }}
                            sectName={m.sectName}
                          />
                          <input
                            type="text"
                            value={m.sectName}
                            onChange={(e) => handleFieldChange(m.id, 'sectName', e.target.value)}
                            placeholder="Tên Lưu Phái"
                            className="flex-1 min-w-0 bg-slate-950/90 border border-white/20 rounded-lg px-2 py-1 text-xs text-amber-200 font-bold focus:outline-none focus:border-amber-400"
                            title="Tên lưu phái"
                          />
                        </div>
                      ) : (
                        <>
                          <SectIcon icon={m.sectIcon} name={m.sectName} size="lg" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-white">{m.sectName}</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${m.sectColor.badge}`}>
                                {rankLabel}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{m.sectRole}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMaster(m.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Xóa người này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Player Name & Discord Tag */}
                  <div className="mt-3 space-y-2">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold block">Thứ bậc Tuyệt:</label>
                            <input
                              type="text"
                              value={m.tuyetRank || ''}
                              onChange={(e) => handleFieldChange(m.id, 'tuyetRank', e.target.value)}
                              placeholder="VD: Nhất Tuyệt"
                              className="w-full bg-slate-950/90 border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold block">Tên Cao Thủ:</label>
                            <input
                              type="text"
                              value={m.playerName}
                              onChange={(e) => handleFieldChange(m.id, 'playerName', e.target.value)}
                              placeholder="VD: Judas"
                              className="w-full bg-slate-950/90 border border-white/20 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block">Discord Tag:</label>
                          <input
                            type="text"
                            value={m.discordTag}
                            onChange={(e) => handleFieldChange(m.id, 'discordTag', e.target.value)}
                            placeholder="@username"
                            className="w-full bg-slate-950/90 border border-white/20 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-400"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Dòng 1: Nhất Tuyệt Judas */}
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-sm sm:text-base font-extrabold text-amber-400 tracking-wide">
                            {rankLabel}
                          </span>
                          <span className="text-sm sm:text-base font-black text-white tracking-wide truncate">
                            {m.playerName}
                          </span>
                        </div>

                        {/* Dòng 2: Lưu phái + Discord Tag */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <span className="font-bold text-amber-200/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-[11px]">
                            {m.sectName}
                          </span>
                          {m.discordTag && (
                            <span className="text-slate-300 font-mono text-xs">
                              {m.discordTag}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Card when Editing in Modal */}
            {isEditing && (
              <button
                type="button"
                onClick={handleAddNewMaster}
                className="p-6 rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 flex flex-col items-center justify-center gap-2 transition-all min-h-[160px]"
              >
                <div className="p-3 rounded-full bg-amber-500/20 text-amber-300">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">Thêm Tuyệt Thế Cao Thủ Mới</span>
                <span className="text-xs text-slate-400">Thêm người chơi / lưu phái khác vào bảng</span>
              </button>
            )}
          </div>

          {/* Discord Markdown Preview Box */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                Xem trước mẫu thông báo Discord Thất Tuyệt Bảng:
              </span>
              <button
                onClick={handleCopyDiscordMarkdown}
                className="text-xs font-bold text-[#5865F2] hover:text-[#7983f5] underline"
              >
                Sao chép ngay
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
              {generateDiscordMarkdown()}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Thất Tuyệt Bảng • Vinh danh Tỉ Võ 1v1 Nghịch Thủy Hàn</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDiscordMarkdown}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center gap-1.5 shadow-md transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Xuất Cho Discord</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

