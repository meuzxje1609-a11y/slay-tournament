import { GamePresetInfo, Tournament } from '../types/tournament';

export const GAME_PRESETS: GamePresetInfo[] = [
  {
    id: 'custom',
    name: 'Multi-Esports / Game Tùy Chọn',
    badge: 'Multi-Game',
    iconName: 'Gamepad2',
    color: 'from-indigo-600 to-violet-500',
    defaultFormat: 'single_elimination',
    defaultBestOf: 1,
    teamSize: 'custom',
    maps: ['Bản đồ thi đấu 1', 'Bản đồ thi đấu 2'],
    description: 'Hỗ trợ tổ chức mọi tựa game Esports: Valorant, LoL, FC Online, CS2, Dota 2, v.v.',
  },
  {
    id: 'lol_1v1',
    name: 'Nghịch Thủy Hàn • Tỉ Võ Lưu Phái 1v1',
    badge: 'NTH 1v1',
    iconName: 'Swords',
    color: 'from-amber-600 via-orange-600 to-red-600',
    defaultFormat: 'single_elimination',
    defaultBestOf: 3,
    teamSize: '1v1',
    maps: ['Lôi Đài Tỉ Võ Hàng Châu', 'Biện Kinh Diễn Võ Trường', 'Đỉnh Nhạn Môn Quan'],
    description: 'Event Tỉ Võ 1v1 Tranh Bá giữa các Lưu Phái Nghịch Thủy Hàn (Toái Mộng, Thiết Y, Huyết Hà, Cửu Linh, Tố Vấn, Long Ngâm).',
  },
  {
    id: 'lol_aram',
    name: 'LoL Custom ARAM 5v5',
    badge: 'ARAM 5v5',
    iconName: 'Flame',
    color: 'from-blue-600 to-cyan-500',
    defaultFormat: 'single_elimination',
    defaultBestOf: 1,
    teamSize: '5v5',
    maps: ['Howling Abyss (Vực Gió Hú)'],
    description: 'Chế độ ARAM hỗn chiến vui nhộn cho Discord server, đánh nhanh rút gọn.',
  },
  {
    id: 'valorant_5v5',
    name: 'Valorant 5v5 Custom',
    badge: 'Valorant',
    iconName: 'Crosshair',
    color: 'from-rose-600 to-red-500',
    defaultFormat: 'double_elimination',
    defaultBestOf: 1,
    teamSize: '5v5',
    maps: ['Ascent', 'Bind', 'Haven', 'Split', 'Sunset', 'Lotus', 'Abyss'],
    description: 'Giải đấu bắn súng chiến thuật Valorant 5v5 cho cộng đồng Discord.',
  },
  {
    id: 'lol_1v1',
    name: 'LoL Solo 1v1 Mid / Abyss',
    badge: 'Solo 1v1',
    iconName: 'Flame',
    color: 'from-amber-500 to-red-600',
    defaultFormat: 'single_elimination',
    defaultBestOf: 3,
    teamSize: '1v1',
    maps: ['Howling Abyss (First Blood / 100 CS / First Tower)', 'Summoner\'s Rift Mid Lane'],
    description: 'Đấu trường kỹ năng 1v1: 1 Mạng đầu, 100 Lính hoặc 1 Trụ đầu.',
  },
  {
    id: 'lol_5v5',
    name: 'LoL Summoner\'s Rift 5v5',
    badge: 'LoL 5v5 SR',
    iconName: 'Shield',
    color: 'from-yellow-600 to-amber-500',
    defaultFormat: 'single_elimination',
    defaultBestOf: 3,
    teamSize: '5v5',
    maps: ['Summoner\'s Rift (Tournament Draft)'],
    description: 'Giải đấu LoL 5v5 chính quy cấm chọn Tournament Draft.',
  },
  {
    id: 'cs2',
    name: 'CS2 5v5 / 1v1 Aim',
    badge: 'CS2',
    iconName: 'Target',
    color: 'from-orange-500 to-amber-600',
    defaultFormat: 'single_elimination',
    defaultBestOf: 1,
    teamSize: '5v5',
    maps: ['Mirage', 'Inferno', 'Nuke', 'Dust II', 'Anubis', 'Ancient', 'Vertigo', 'Aim_Map 1v1'],
    description: 'Giải đấu Counter-Strike 2 Custom Match hoặc Solo Aim.',
  },
  {
    id: 'tft',
    name: 'Đấu Trường Chân Lý (TFT)',
    badge: 'TFT Lobby',
    iconName: 'Crown',
    color: 'from-purple-600 to-indigo-600',
    defaultFormat: 'round_robin',
    defaultBestOf: 3,
    teamSize: '8-player',
    maps: ['Lobby 8 người (Tính điểm top 1-8)'],
    description: 'Lobby 8 người tính điểm tích lũy qua các ván.',
  },
];

export interface SectPresetDivisionConfig {
  id: string;
  name: string;
  sectKey: string;
  sectIcon: string;
  participants: { id: string; name: string; discordTag: string; seed: number }[];
}

export const SAMPLE_SECT_DIVISIONS: SectPresetDivisionConfig[] = [];
