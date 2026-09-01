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
    return list;
  } catch {
    return [];
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
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

export function setAdminAuthState(isAuth: boolean): void {
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, isAuth ? 'true' : 'false');
  } catch (err) {
    console.error('Error setting admin auth:', err);
  }
}

export function exportTournamentsToJSON(tournaments: Tournament[]): string {
  return JSON.stringify(tournaments, null, 2);
}

export function importTournamentsFromJSON(jsonString: string): Tournament[] | null {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data) && data.length > 0 && data[0].id && data[0].participants) {
      return data as Tournament[];
    }
    if (data.id && data.participants) {
      return [data as Tournament];
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
      saveTournaments(data); // Sync local cache
      return data as Tournament[];
    }
    return null;
  } catch (err) {
    console.warn('API fetch tournaments failed, using local cache:', err);
    return null;
  }
}

export async function syncTournamentsToAPI(tournaments: Tournament[]): Promise<boolean> {
  saveTournaments(tournaments); // Always update local cache
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/tournaments` : '/api/tournaments';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tournaments),
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


