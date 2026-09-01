import { Tournament, Participant, Match } from '../types/tournament';
import { calculateRoundRobinStandings } from './bracketGenerator';

export function formatDiscordAnnouncement(t: Tournament): string {
  const gameEmoji = t.game.includes('aram') ? '❄️' : t.game.includes('1v1') ? '⚔️' : t.game.includes('val') ? '🎯' : '🏆';
  const formatName = t.format === 'single_elimination' ? 'Loại Trực Tiếp (Single Elimination)' : t.format === 'double_elimination' ? 'Nhánh Thắng/Thua (Double Elimination)' : 'Vòng Bảng (Round Robin)';

  const lines = [
    `# ${gameEmoji} ${t.name.toUpperCase()}`,
    `> **Game:** ${t.customGameName || t.game.toUpperCase()} | **Thể thức:** ${formatName}`,
    t.settings.discordServerName ? `> 🏛️ **Server:** ${t.settings.discordServerName}` : '',
  ];

  // Prizes detailed breakdown
  const pz = t.settings.prizes;
  if (pz) {
    const prizeSections: string[] = [];
    if (pz.cash.enabled && pz.cash.totalAmount) {
      prizeSections.push(`💵 **Tiền Mặt:** ${pz.cash.totalAmount} (🥇 Quán Quân: ${pz.cash.champion || '50%'} | 🥈 Á Quân: ${pz.cash.runnerUp || '30%'})`);
    }
    if (pz.inGame.enabled && pz.inGame.totalAmount) {
      prizeSections.push(`🎮 **Tiền In-Game (${pz.inGame.currencyName || 'VP/RP'}):** ${pz.inGame.totalAmount}`);
    }
    if (pz.roles.enabled && pz.roles.championRole) {
      prizeSections.push(`👑 **Role Server:** \`${pz.roles.championRole}\` + \`${pz.roles.runnerUpRole || '@Á Quân'}\``);
    }
    if (pz.other.enabled && pz.other.items.length > 0) {
      prizeSections.push(`🎁 **Quà Tặng Khác:** ${pz.other.items.join(', ')}`);
    }
    if (prizeSections.length > 0) {
      lines.push('', '### 🎁 CƠ CẤU GIẢI THƯỞNG:', ...prizeSections.map(s => `> ${s}`));
    } else if (t.settings.prizePool) {
      lines.push(`> 💰 **Giải thưởng:** ${t.settings.prizePool}`);
    }
  } else if (t.settings.prizePool) {
    lines.push(`> 💰 **Giải thưởng:** ${t.settings.prizePool}`);
  }

  lines.push('', `### 📋 DANH SÁCH THAM GIA (${t.participants.length} Đội/Người chơi):`);

  t.participants.forEach((p, idx) => {
    const memberStr = p.members && p.members.length > 0 ? ` [${p.members.join(', ')}]` : '';
    lines.push(`${idx + 1}. **${p.name}** ${p.discordTag ? `(${p.discordTag})` : ''}${memberStr} *(Seed #${p.seed})*`);
  });

  if (t.settings.rulesText) {
    lines.push('', '### 📜 LUẬT THI ĐẤU:', t.settings.rulesText);
  }

  lines.push(
    '',
    '--------------------------------------------------',
    '📢 *Tất cả các đội chuẩn bị vào đúng phòng Voice được chỉ định 15 phút trước giờ thi đấu! Chúc anh em thi đấu hết mình!* 🔥'
  );

  return lines.filter(l => l !== '').join('\n');
}

export function formatDiscordNextMatches(t: Tournament): string {
  const readyMatches: { match: Match; roundName: string }[] = [];

  t.rounds.forEach((round) => {
    round.matches.forEach((match) => {
      if (match.status === 'ready' || match.status === 'live') {
        readyMatches.push({ match, roundName: round.name });
      }
    });
  });

  if (readyMatches.length === 0) {
    return `### ⏳ ${t.name} - HIỆN CHƯA CÓ TRẬN ĐẤU MỚI SẴN SÀNG\n> Vui lòng hoàn thành các trận trước hoặc kiểm tra kết quả!`;
  }

  const lines = [
    `## ⚔️ LỊCH THI ĐẤU TIẾP THEO - ${t.name.toUpperCase()}`,
    `> 🔴 Cập nhật danh sách các cặp đấu đang sẵn sàng/đang diễn ra:`,
    '',
  ];

  readyMatches.forEach(({ match, roundName }, idx) => {
    const p1 = t.participants.find(p => p.id === match.participant1Id);
    const p2 = t.participants.find(p => p.id === match.participant2Id);

    const p1Tag = p1?.discordTag ? ` (${p1.discordTag})` : '';
    const p2Tag = p2?.discordTag ? ` (${p2.discordTag})` : '';
    const statusEmoji = match.status === 'live' ? '🔴 **[ĐANG ĐẤU]**' : '⏳ **[SẴN SÀNG]**';

    lines.push(`**Trận ${idx + 1}: ${roundName} (BO${match.bestOf})** ${statusEmoji}`);
    lines.push(`🔹 **${p1?.name || 'TBD'}**${p1Tag} 🆚 🔸 **${p2?.name || 'TBD'}**${p2Tag}`);
    if (match.voiceChannel) lines.push(`🎙️ **Phòng Voice:** \`${match.voiceChannel}\``);
    if (match.scheduledTime) lines.push(`⏰ **Thời gian:** \`${match.scheduledTime}\``);
    lines.push('');
  });

  lines.push('👉 *Các Captain vui lòng ping thành viên và vào đúng voice channel!*');
  return lines.join('\n');
}

export function formatDiscordStandings(t: Tournament): string {
  if (t.format === 'round_robin') {
    const standings = calculateRoundRobinStandings(t.participants, t.rounds);
    const lines = [
      `## 📊 BẢNG XẾP HẠNG ĐIỂM - ${t.name.toUpperCase()}`,
      '```',
      'TOP | TÊN ĐỘI / PLAYER       | ĐIỂM | THẮNG | THUA | HIỆU SỐ',
      '----+------------------------+------+-------+------+--------',
    ];

    standings.forEach((p, idx) => {
      const rank = `${idx + 1}`.padEnd(3);
      const name = p.name.slice(0, 22).padEnd(22);
      const pts = `${p.stats?.points || 0}`.padStart(4);
      const w = `${p.stats?.wins || 0}`.padStart(5);
      const l = `${p.stats?.losses || 0}`.padStart(4);
      const diff = `${(p.stats?.roundsWon || 0) - (p.stats?.roundsLost || 0)}`.padStart(6);
      lines.push(`${rank} | ${name} | ${pts} | ${w} | ${l} | ${diff}`);
    });

    lines.push('```');
    return lines.join('\n');
  }

  // Bracket overview text
  const lines = [
    `## 🏆 TIẾN ĐỘ BẢNG ĐẤU - ${t.name.toUpperCase()}`,
    '',
  ];

  t.rounds.forEach((round) => {
    lines.push(`### 🔹 ${round.name}:`);
    round.matches.forEach((m) => {
      const p1 = t.participants.find(p => p.id === m.participant1Id)?.name || 'TBD';
      const p2 = t.participants.find(p => p.id === m.participant2Id)?.name || 'TBD';

      if (m.status === 'finished') {
        const winnerName = t.participants.find(p => p.id === m.winnerId)?.name;
        lines.push(`  ✅ **${p1}** \`[${m.score1} - ${m.score2}]\` **${p2}** ➔ 👑 **${winnerName}** thắng`);
      } else if (m.status === 'live') {
        lines.push(`  🔴 **${p1}** \`[${m.score1} - ${m.score2}]\` **${p2}** *(Đang thi đấu)*`);
      } else if (m.status === 'ready') {
        lines.push(`  ⏳ **${p1}** 🆚 **${p2}** *(Chờ đấu - BO${m.bestOf})*`);
      } else {
        lines.push(`  🔒 *${p1}* 🆚 *${p2}*`);
      }
    });
    lines.push('');
  });

  return lines.join('\n');
}

export function formatDiscordChampion(t: Tournament): string {
  if (!t.championId) return 'Giải đấu chưa có nhà vô địch!';

  const champion = t.participants.find(p => p.id === t.championId);
  const runnerUp = t.participants.find(p => p.id === t.runnerUpId);

  const lines = [
    `# 👑👑👑 KẾT QUẢ CHUNG CUỘC - ${t.name.toUpperCase()} 👑👑👑`,
    '',
    `🥇 **QUÁN QUÂN (CHAMPION):** 🏆 **${champion?.name}** ${champion?.discordTag ? `(${champion.discordTag})` : ''}`,
    runnerUp ? `🥈 **Á QUÂN (RUNNER-UP):** 🥈 **${runnerUp.name}** ${runnerUp.discordTag ? `(${runnerUp.discordTag})` : ''}` : '',
    t.settings.prizePool ? `💰 **Phần thưởng:** ${t.settings.prizePool}` : '',
    '',
    '🎉 *Xin chúc mừng nhà vô địch và cảm ơn tất cả các tuyển thủ đã cống hiến những trận đấu kịch tính và mãn nhãn! Hẹn gặp lại ở giải đấu tiếp theo!* 🚀🔥'
  ];

  return lines.filter(l => l !== '').join('\n');
}

export function formatDiscordRollcall(t: Tournament): string {
  const lines = [
    `## 📢 ĐIỂM DANH THI ĐẤU (ROLLCALL) - ${t.name.toUpperCase()}`,
    `> Các Captain hoặc Vận động viên vui lòng react ✅ vào tin nhắn này để xác nhận có mặt!`,
    '',
    '**DANH SÁCH ĐỘI:**',
  ];

  t.participants.forEach((p, idx) => {
    lines.push(`${idx + 1}. **${p.name}** ${p.discordTag ? `(${p.discordTag})` : ''}`);
  });

  lines.push('', '⏰ *Hạn chót điểm danh: 10 phút trước giờ bắt đầu. Đội vắng mặt sẽ bị xử thua Walkover (FF).*');
  return lines.join('\n');
}
