import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FIREBASE_DB_URL = process.env.FIREBASE_DATABASE_URL
  ? process.env.FIREBASE_DATABASE_URL.replace(/\/$/, '')
  : '';

// Enable CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Ensure local fallback directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LOCAL_TOURNAMENTS_FILE = path.join(DATA_DIR, 'tournaments.json');
const LOCAL_MASTERS_FILE = path.join(DATA_DIR, 'that_tuyet_masters.json');

// Helper to interact with Firebase Realtime Database REST API
async function getFirebaseData(pathKey: string) {
  if (!FIREBASE_DB_URL) return null;
  try {
    const url = `${FIREBASE_DB_URL}/${pathKey}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Firebase fetch error [${pathKey}]:`, err);
    return null;
  }
}

async function setFirebaseData(pathKey: string, data: any) {
  if (!FIREBASE_DB_URL) return false;
  try {
    const url = `${FIREBASE_DB_URL}/${pathKey}.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error(`Firebase save error [${pathKey}]:`, err);
    return false;
  }
}

// Local File Helper Fallbacks
function getLocalData(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function setLocalData(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------
// API ENDPOINTS
// ---------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseConnected: Boolean(FIREBASE_DB_URL),
    mode: FIREBASE_DB_URL ? 'Firebase Cloud Database' : 'Local File Storage',
  });
});

// GET /api/tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    if (FIREBASE_DB_URL) {
      const data = await getFirebaseData('tournaments');
      if (data && Array.isArray(data)) {
        return res.json(data);
      }
    }
    const localData = getLocalData(LOCAL_TOURNAMENTS_FILE);
    if (localData && Array.isArray(localData)) {
      return res.json(localData);
    }
    return res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch tournaments' });
  }
});

// POST /api/tournaments
app.post('/api/tournaments', async (req, res) => {
  try {
    const tournaments = req.body;
    if (!Array.isArray(tournaments)) {
      return res.status(400).json({ error: 'Body must be an array of tournaments' });
    }

    let savedRemote = false;
    if (FIREBASE_DB_URL) {
      savedRemote = await setFirebaseData('tournaments', tournaments);
    }
    const savedLocal = setLocalData(LOCAL_TOURNAMENTS_FILE, tournaments);

    return res.json({
      success: savedRemote || savedLocal,
      count: tournaments.length,
      remoteSaved: savedRemote,
      localSaved: savedLocal,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save tournaments' });
  }
});

// GET /api/that-tuyet-masters
app.get('/api/that-tuyet-masters', async (req, res) => {
  try {
    if (FIREBASE_DB_URL) {
      const data = await getFirebaseData('that_tuyet_masters');
      if (data && Array.isArray(data)) {
        return res.json(data);
      }
    }
    const localData = getLocalData(LOCAL_MASTERS_FILE);
    if (localData && Array.isArray(localData)) {
      return res.json(localData);
    }
    return res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch masters' });
  }
});

// POST /api/that-tuyet-masters
app.post('/api/that-tuyet-masters', async (req, res) => {
  try {
    const masters = req.body;
    if (!Array.isArray(masters)) {
      return res.status(400).json({ error: 'Body must be an array of masters' });
    }

    let savedRemote = false;
    if (FIREBASE_DB_URL) {
      savedRemote = await setFirebaseData('that_tuyet_masters', masters);
    }
    const savedLocal = setLocalData(LOCAL_MASTERS_FILE, masters);

    return res.json({
      success: savedRemote || savedLocal,
      count: masters.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save masters' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 SLAY TOURNAMENT API Server running on port ${PORT}`);
  console.log(`📡 Storage Mode: ${FIREBASE_DB_URL ? `Firebase (${FIREBASE_DB_URL})` : 'Local File Fallback'}`);
});
