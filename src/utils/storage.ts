import { Tournament } from '../types/tournament';
import {
  generateSingleElimination,
  generateDoubleElimination,
  generateRoundRobin,
  getRoundName,
} from './bracketGenerator';

const STORAGE_KEY = 'esports_tournament_bracket_data';
const ACTIVE_TOURNAMENT_ID_KEY = 'esports_active_tournament_id';
const ADMIN_AUTH_KEY = 'esports_admin_auth_state';

export function createInitialTournaments(): Tournament[] {
  return [];
}

export function getActiveTournamentId(): string {
  return localStorage.getItem(ACTIVE_TOURNAMENT_ID_KEY) || '';
}

export function setActiveTournamentId(id: string): void {
  localStorage.setItem(ACTIVE_TOURNAMENT_ID_KEY, id);
}

export function sanitizeTournament(t: Tournament): Tournament {
  if (!t || !t.name) return t;
  let name = t.name;

  // 1. Remove all division names that were appended with • or -
  if (t.divisions && t.divisions.length > 0) {
    for (const d of t.divisions) {
      if (d.name) {
        const escaped = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(\\s*[•\\-]\\s*${escaped})+`, 'gi');
        name = name.replace(regex, '');
      }
    }
  }

  // 2. Also remove any repeated standard sect names if appended
  const knownSects = ['Toái Mộng', 'Thần Tướng', 'Tố Vấn', 'Cửu Linh', 'Huyết Hà', 'Thiết Y', 'Long Ngâm', 'Huyền Cơ', 'Triều Lam'];
  for (const s of knownSects) {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(\\s*[•\\-]\\s*${escaped})+`, 'gi');
    name = name.replace(regex, '');
  }

  // 3. Fallback: if name still has " • ...", clean trailing bullet repeats
  const bulletParts = name.split('•').map(p => p.trim()).filter(Boolean);
  if (bulletParts.length > 1) {
    const base = bulletParts[0];
    const allRestSameOrDivision = bulletParts.slice(1).every(p => 
      knownSects.some(k => k.toLowerCase() === p.toLowerCase()) || 
      (t.divisions && t.divisions.some(d => d.name.toLowerCase() === p.toLowerCase())) ||
      p.toLowerCase() === base.toLowerCase()
    );
    if (allRestSameOrDivision) {
      name = base;
    }
  }

  return {
    ...t,
    name: name.trim() || t.name,
  };
}

export function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }
    const sanitizedList = list.map(sanitizeTournament);
    // Write back sanitized list to clean localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedList));
    return sanitizedList;
  } catch {
    return [];
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  try {
    const sanitized = tournaments.map(sanitizeTournament);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Error saving tournaments to localStorage:', err);
  }
}

export function createDefaultTournament(): Tournament | null {
  return null;
}

export function getAdminAuthState(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthState(isAdmin: boolean): void {
  localStorage.setItem(ADMIN_AUTH_KEY, isAdmin ? 'true' : 'false');
}

export function exportTournamentsToJSON(tournaments: Tournament[]): string {
  const sanitized = tournaments.map(sanitizeTournament);
  return JSON.stringify(sanitized, null, 2);
}

export function importTournamentsFromJSON(jsonString: string): Tournament[] | null {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data) && data.length > 0 && data[0].id && data[0].participants) {
      return (data as Tournament[]).map(sanitizeTournament);
    }
    if (data.id && data.participants) {
      return [sanitizeTournament(data as Tournament)];
    }
    return null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------------
// BACKEND API & CLOUD DATABASE SYNC HELPERS (Render + Firebase)
// -------------------------------------------------------------------
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function fetchTournamentsFromAPI(): Promise<Tournament[] | null> {
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/tournaments` : '/api/tournaments';
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const remoteSanitized = (data as Tournament[]).map(sanitizeTournament);
      const localList = loadTournaments();

      // Merge remote with local cache: keep whichever has the newer updatedAt timestamp
      const mergedList = remoteSanitized.map((remoteT) => {
        const localT = localList.find((l) => l.id === remoteT.id);
        if (!localT) return remoteT;
        const localUpdated = localT.updatedAt || 0;
        const remoteUpdated = remoteT.updatedAt || 0;
        return localUpdated > remoteUpdated ? localT : remoteT;
      });

      // Keep local tournaments not present in remote
      for (const localT of localList) {
        if (!mergedList.some((m) => m.id === localT.id)) {
          mergedList.push(localT);
        }
      }

      saveTournaments(mergedList);
      return mergedList;
    }
    return null;
  } catch (err) {
    console.warn('API fetch tournaments failed, using local cache:', err);
    return null;
  }
}

export async function syncTournamentsToAPI(tournaments: Tournament[]): Promise<boolean> {
  const sanitized = tournaments.map(sanitizeTournament);
  saveTournaments(sanitized); // Always update local cache
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/tournaments` : '/api/tournaments';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
    return res.ok;
  } catch (err) {
    console.warn('API sync tournaments failed:', err);
    return false;
  }
}

export async function fetchMastersFromAPI(): Promise<any[] | null> {
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/that-tuyet-masters` : '/api/that-tuyet-masters';
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('API fetch masters failed:', err);
    return null;
  }
}

export async function syncMastersToAPI(masters: any[]): Promise<boolean> {
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/that-tuyet-masters` : '/api/that-tuyet-masters';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(masters),
    });
    return res.ok;
  } catch (err) {
    console.warn('API sync masters failed:', err);
    return false;
  }
}


