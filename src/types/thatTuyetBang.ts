export interface ThatTuyetMaster {
  id: string;
  sectKey: string;
  sectName: string;        // Tên Lưu Phái (VD: Toái Mộng)
  tuyetRank: string;       // Thứ bậc Tuyệt (VD: "Nhất Tuyệt", "Nhị Tuyệt", "Tam Tuyệt", "Tứ Tuyệt", "Ngũ Tuyệt", "Lục Tuyệt", "Thất Tuyệt")
  sectTitle: string;       // Danh hiệu Phái (VD: Đoạt Mệnh)
  sectRole: string;        // Vai trò / Lối đánh (VD: Sát Thủ • Đoản Đao)
  sectIcon: string;        // Biểu tượng (VD: 🗡️)
  sectColor: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    gradient: string;
  };
  playerName: string;      // Tên Cao Thủ Top 1 (VD: Judas)
  discordTag: string;      // @player_discord
  serverRank: string;      // e.g. "Top 1 Phái • Đại Tông Sư"
  winRate: string;         // e.g. "94% (16-1)"
  favoriteSkill?: string;  // Chiêu thức sở trường
  roleReward: string;      // Role Server nhận được
  weapon?: string;         // Vũ khí trấn phái
  quote?: string;          // Danh ngôn kiếm hiệp
}

export interface SectIconOption {
  key: string;
  name: string;
  url: string;
  type: 'image' | 'emoji';
  color?: string;
}

export const SECT_ICON_OPTIONS: SectIconOption[] = [
  { key: 'toai_mong', name: 'Toái Mộng (Đoản Đao)', url: '/icons/sects/toai_mong.webp', type: 'image' },
  { key: 'thiet_y', name: 'Thiết Y (Thiết Quyền)', url: '/icons/sects/thiet_y.webp', type: 'image' },
  { key: 'huyet_ha', name: 'Huyết Hà (Trường Thương)', url: '/icons/sects/huyet_ha.webp', type: 'image' },
  { key: 'than_tuong', name: 'Thần Tướng (Phi Đao / Cung)', url: '/icons/sects/than_tuong.webp', type: 'image' },
  { key: 'cuu_linh', name: 'Cửu Linh (Hồn Đăng)', url: '/icons/sects/cuu_linh.webp', type: 'image' },
  { key: 'to_van', name: 'Tố Vấn (Tiên Trù)', url: '/icons/sects/to_van.webp', type: 'image' },
  { key: 'long_ngam', name: 'Long Ngâm (Long Kiếm)', url: '/icons/sects/long_ngam.webp', type: 'image' },
  // Common martial arts emojis
  { key: 'sword', name: 'Song Kiếm', url: '⚔️', type: 'emoji' },
  { key: 'dagger', name: 'Đoản Đao', url: '🗡️', type: 'emoji' },
  { key: 'shield', name: 'Khiên Giáp', url: '🛡️', type: 'emoji' },
  { key: 'bow', name: 'Cung Nỏ', url: '🏹', type: 'emoji' },
  { key: 'magic', name: 'Hồn Đăng', url: '🔮', type: 'emoji' },
  { key: 'lotus', name: 'Hoa Sen', url: '🪷', type: 'emoji' },
  { key: 'lightning', name: 'Lôi Điện', url: '⚡', type: 'emoji' },
  { key: 'dragon', name: 'Thần Long', url: '🐉', type: 'emoji' },
  { key: 'flag', name: 'Chiến Kỳ', url: '🚩', type: 'emoji' },
  { key: 'crown', name: 'Vương Miện', url: '👑', type: 'emoji' },
  { key: 'trophy', name: 'Chiến Cúp', url: '🏆', type: 'emoji' },
];

// 6 Lưu Phái Nghịch Thủy Hàn Hiện Tại (Tạm thời bỏ đi Huyền Cơ theo yêu cầu)
export const DEFAULT_THAT_TUYET_MASTERS: ThatTuyetMaster[] = [
  {
    id: 'sect-1',
    sectKey: 'toai_mong',
    sectName: 'Toái Mộng',
    tuyetRank: 'Nhất Tuyệt',
    sectTitle: 'Đoạt Mệnh',
    sectRole: 'Sát Thủ • Đoản Đao Bạo Kích',
    sectIcon: '/icons/sects/toai_mong.webp',
    sectColor: {
      bg: 'bg-rose-950/40',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      gradient: 'from-rose-600 via-pink-600 to-rose-700',
    },
    playerName: 'Judas',
    discordTag: '@judas#8888',
    serverRank: 'TOP 1 TOÁI MỘNG 🏆',
    winRate: '93.3% (14W - 1L)',
    roleReward: '@Đệ Nhất Toái Mộng 🗡️',
  },
  {
    id: 'sect-2',
    sectKey: 'thiet_y',
    sectName: 'Thiết Y',
    tuyetRank: 'Nhị Tuyệt',
    sectTitle: 'Bất Phá',
    sectRole: 'Đỡ Đòn • Kim Cương Thiết Quyền',
    sectIcon: '/icons/sects/thiet_y.webp',
    sectColor: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      gradient: 'from-amber-600 via-yellow-600 to-amber-700',
    },
    playerName: 'ThietGiap',
    discordTag: '@thiet_thuann#6666',
    serverRank: 'TOP 1 THIẾT Y 🏆',
    winRate: '88.2% (15W - 2L)',
    roleReward: '@Đệ Nhất Thiết Y 🛡️',
  },
  {
    id: 'sect-3',
    sectKey: 'huyet_ha',
    sectName: 'Huyết Hà',
    tuyetRank: 'Tam Tuyệt',
    sectTitle: 'Vạn Quân',
    sectRole: 'Đấu Sĩ • Trường Thương Kỵ Chiến',
    sectIcon: '/icons/sects/huyet_ha.webp',
    sectColor: {
      bg: 'bg-red-950/40',
      border: 'border-red-500/40',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      gradient: 'from-red-600 via-orange-600 to-red-700',
    },
    playerName: 'BaVuong',
    discordTag: '@ba_vuong#9999',
    serverRank: 'TOP 1 HUYẾT HÀ 🏆',
    winRate: '90.0% (18W - 2L)',
    roleReward: '@Đệ Nhất Huyết Hà 🚩',
  },
  {
    id: 'sect-4',
    sectKey: 'cuu_linh',
    sectName: 'Cửu Linh',
    tuyetRank: 'Tứ Tuyệt',
    sectTitle: 'U Hồn',
    sectRole: 'Triệu Hồi • Dược Sư Cổ Thuật',
    sectIcon: '/icons/sects/cuu_linh.webp',
    sectColor: {
      bg: 'bg-purple-950/40',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      gradient: 'from-purple-600 via-fuchsia-600 to-purple-700',
    },
    playerName: 'UPhung',
    discordTag: '@u_phung#7777',
    serverRank: 'TOP 1 CỬU LINH 🏆',
    winRate: '86.7% (13W - 2L)',
    roleReward: '@Đệ Nhất Cửu Linh 🔮',
  },
  {
    id: 'sect-5',
    sectKey: 'to_van',
    sectName: 'Tố Vấn',
    tuyetRank: 'Ngũ Tuyệt',
    sectTitle: 'Diệu Thủ',
    sectRole: 'Trị Liệu • Lụa Tiên Trì Hoãn',
    sectIcon: '/icons/sects/to_van.webp',
    sectColor: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    },
    playerName: 'BachY',
    discordTag: '@bach_y#5555',
    serverRank: 'TOP 1 TỐ VẤN 🏆',
    winRate: '87.5% (14W - 2L)',
    roleReward: '@Đệ Nhất Tố Vấn 🪷',
  },
  {
    id: 'sect-6',
    sectKey: 'long_ngam',
    sectName: 'Long Ngâm',
    tuyetRank: 'Lục Tuyệt',
    sectTitle: 'Lôi Kiếm',
    sectRole: 'Kiếm Khách • Song Kiếm Lôi Khí',
    sectIcon: '/icons/sects/long_ngam.webp',
    sectColor: {
      bg: 'bg-blue-950/40',
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    },
    playerName: 'KiemThanh',
    discordTag: '@kiem_thanh#1111',
    serverRank: 'TOP 1 LONG NGÂM 🏆',
    winRate: '95.0% (19W - 1L)',
    roleReward: '@Đệ Nhất Long Ngâm ⚡',
  },
];
