import React, { useState } from 'react';
import { ThatTuyetMaster } from '../types/thatTuyetBang';
import { SectIcon } from './SectIcon';
import { SectIconPicker } from './SectIconPicker';
import {
  Crown,
  Swords,
  Share2,
  ChevronRight,
  Edit3,
  Save,
  RotateCcw,
  Check,
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

interface ThatTuyetBangWidgetProps {
  masters: ThatTuyetMaster[];
  onUpdateMasters: (newMasters: ThatTuyetMaster[]) => void;
  onOpenModal: () => void;
  onQuickExportDiscord: () => void;
  isAdmin?: boolean;
}

export const ThatTuyetBangWidget: React.FC<ThatTuyetBangWidgetProps> = ({
  masters,
  onUpdateMasters,
  onOpenModal,
  onQuickExportDiscord,
  isAdmin = true,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedMasters, setEditedMasters] = useState<ThatTuyetMaster[]>(masters);
  const [copied, setCopied] = useState<boolean>(false);

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

  const handleCancel = () => {
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

  // Generate Clean Discord Markdown (không chứa vũ khí, tuyệt kỹ, câu hook)
  const generateCleanDiscordMarkdown = () => {
    const list = isEditing ? editedMasters : masters;
    const lines = [
      `# ⚔️ THẤT TUYỆT BẢNG — TỈ VÕ LƯU PHÁI NGHỊCH THỦY HÀN ⚔️`,
      `> 🏆 **VINH DANH CÁC CAO THỦ TOP 1 TẠI CÁC ĐẠI LƯU PHÁI**`,
      `> 🏛️ **Server Discord:** Slay Gaming Community`,
      `> 📅 **Cập nhật:** ${new Date().toLocaleDateString('vi-VN')}`,
      '',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...list.map((m, idx) => {
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

  const handleCopyDiscord = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateCleanDiscordMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const currentMasters = isEditing ? editedMasters : masters;

  return (
    <div
      id="that-tuyet-bang-widget"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900/95 to-indigo-950/80 border border-amber-500/35 shadow-2xl p-4 w-full lg:w-[410px] transition-all group hover:border-amber-500/50 flex flex-col"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 relative z-10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/25 border border-amber-500/40 text-amber-300 shadow-sm shrink-0">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black text-amber-300 tracking-wider uppercase truncate">
                THẤT TUYỆT BẢNG
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-200 border border-amber-500/40 shrink-0">
                {currentMasters.length} Tuyệt
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Vinh danh Top 1 Lưu Phái • Nghịch Thủy Hàn
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={handleAddNewMaster}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                    title="Thêm người mới vào bảng"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                    title="Lưu các thay đổi"
                  >
                    <Save className="w-3 h-3" />
                    <span>Lưu</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-all"
                    title="Hủy chỉnh sửa"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditedMasters(masters);
                    setIsEditing(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Chỉnh sửa danh sách Thất Tuyệt"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Sửa</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={onOpenModal}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-2 py-1 rounded-lg transition-colors"
            title="Mở bảng chi tiết"
          >
            <span>Chi tiết</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Sect Masters Vertical List */}
      <div className="pt-2.5 pb-2 relative z-10 flex-1 space-y-1.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
        {currentMasters.map((m, index) => {
          const rankLabel = m.tuyetRank || `Tuyệt #${index + 1}`;
          return (
            <div
              key={m.id}
              className={`p-2 rounded-xl border transition-all relative ${
                m.sectColor.bg
              } ${
                isEditing
                  ? 'border-amber-500/40 bg-slate-900/90'
                  : `${m.sectColor.border} hover:border-amber-400/50 hover:bg-white/[0.04]`
              }`}
            >
              {isEditing ? (
                /* Edit Mode: Inline Form for each Sect with Delete & Icon & Sect name */
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-1.5">
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
                        className="flex-1 min-w-0 bg-slate-950/90 border border-white/20 rounded-md px-1.5 py-0.5 text-[11px] text-amber-200 font-bold focus:outline-none focus:border-amber-400"
                        title="Tên lưu phái"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={m.tuyetRank || ''}
                        onChange={(e) => handleFieldChange(m.id, 'tuyetRank', e.target.value)}
                        placeholder="VD: Nhất Tuyệt"
                        className="bg-slate-950/90 border border-amber-500/30 rounded-lg px-2 py-0.5 text-[10px] text-amber-300 w-20 focus:outline-none focus:border-amber-400 font-bold"
                        title="Thứ bậc Tuyệt"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteMaster(m.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa người này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9px] text-slate-400 font-semibold block">Tên Cao Thủ:</label>
                      <input
                        type="text"
                        value={m.playerName}
                        onChange={(e) => handleFieldChange(m.id, 'playerName', e.target.value)}
                        placeholder="VD: Judas"
                        className="w-full bg-slate-950/90 border border-white/20 rounded-md px-2 py-0.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-semibold block">Discord Tag:</label>
                      <input
                        type="text"
                        value={m.discordTag}
                        onChange={(e) => handleFieldChange(m.id, 'discordTag', e.target.value)}
                        placeholder="@username"
                        className="w-full bg-slate-950/90 border border-white/20 rounded-md px-2 py-0.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode: Dòng trên "Nhất Tuyệt Judas", Dòng dưới Tên Lưu Phái + Discord */
                <div className="flex items-center justify-between gap-2 py-1">
                  {/* Left: Icon + "Nhất Tuyệt Judas" + Sect on 2nd line */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SectIcon icon={m.sectIcon} name={m.sectName} size="md" />
                    <div className="min-w-0">
                      {/* Dòng 1: Nhất Tuyệt Judas */}
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-xs sm:text-[13px] font-extrabold text-amber-400 tracking-wide">
                          {rankLabel}
                        </span>
                        <span className="text-xs sm:text-[13px] font-black text-white tracking-wide truncate">
                          {m.playerName}
                        </span>
                      </div>

                      {/* Dòng 2: Lưu phái + Discord Tag */}
                      <div className="flex items-center gap-2 text-[11px] mt-0.5 whitespace-nowrap">
                        <span className="font-semibold text-amber-200/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px]">
                          {m.sectName}
                        </span>
                        {m.discordTag && (
                          <span className="text-slate-400 font-mono text-[10px] truncate">
                            {m.discordTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Nút Thêm ở cuối danh sách khi đang sửa */}
        {isEditing && (
          <button
            type="button"
            onClick={handleAddNewMaster}
            className="w-full py-2 border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Tuyệt Thế Cao Thủ Mới</span>
          </button>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] relative z-10 shrink-0">
        <button
          onClick={handleCopyDiscord}
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#8ea1e1] hover:text-white border border-[#5865F2]/40'
          }`}
          title="Xuất bảng thông báo sạch cho Discord"
        >
          {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
          <span>{copied ? 'Đã sao chép Discord!' : 'Xuất Discord'}</span>
        </button>

        <button
          onClick={onOpenModal}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-[10px] font-black shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
        >
          <Swords className="w-3 h-3" />
          <span>Mở Bảng Vàng</span>
        </button>
      </div>
    </div>
  );
};

