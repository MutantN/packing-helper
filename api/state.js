// Vercel serverless function: GET/POST shared moving-helper state via Vercel KV.
// Requires a Vercel KV database connected to this project (env vars are auto-injected).
import { kv } from '@vercel/kv';

const STATE_KEY = 'moving_helper_state';

const DEFAULT_STATE = {
  done: [],
  moveDate: null,
  startDate: null,
  boxes: [],
  boxNumByRoom: {},
  expenses: [],
  budgetLimit: null,
  updatedAt: null,
  updatedBy: null
};

const EXPENSE_CATEGORIES = ['Movers & truck', 'Boxes & supplies', 'Storage', 'Deposits & fees', 'Other'];

function sanitizeBoxes(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(b => b && typeof b === 'object')
    .map(b => ({
      id: typeof b.id === 'string' ? b.id : null,
      roomId: typeof b.roomId === 'string' ? b.roomId : null,
      num: Number.isFinite(b.num) ? b.num : 0,
      items: Array.isArray(b.items) ? b.items.filter(x => typeof x === 'string').slice(0, 200) : []
    }))
    .filter(b => b.id && b.roomId)
    .slice(0, 2000); // sane upper bound so one bad client can't blow up storage
}

function sanitizeBoxNumByRoom(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  for (const [roomId, num] of Object.entries(raw)) {
    if (typeof roomId === 'string' && Number.isFinite(num)) {
      out[roomId] = num;
    }
  }
  return out;
}

function sanitizeExpenses(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(e => e && typeof e === 'object')
    .map(e => ({
      id: typeof e.id === 'string' ? e.id : null,
      desc: typeof e.desc === 'string' ? e.desc.slice(0, 200) : '',
      cat: EXPENSE_CATEGORIES.includes(e.cat) ? e.cat : 'Other',
      amt: Number.isFinite(e.amt) && e.amt >= 0 ? e.amt : 0
    }))
    .filter(e => e.id && e.desc)
    .slice(0, 2000);
}

function sanitizeBudgetLimit(raw) {
  if (raw === null || raw === undefined) return null;
  return Number.isFinite(raw) && raw >= 0 ? raw : null;
}

export default async function handler(req, res) {
  // Basic CORS / method handling (same-origin in practice, but harmless to allow)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  try {
    if (req.method === 'GET') {
      const stored = await kv.get(STATE_KEY);
      // Merge with defaults so older stored records (pre-boxes/budget) don't break the client.
      res.status(200).json(stored ? { ...DEFAULT_STATE, ...stored } : DEFAULT_STATE);
      return;
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      // Basic shape validation — don't trust the client blindly.
      const incoming = {
        done: Array.isArray(body.done) ? body.done.filter(x => typeof x === 'string') : [],
        moveDate: typeof body.moveDate === 'string' || body.moveDate === null ? body.moveDate : null,
        startDate: typeof body.startDate === 'string' || body.startDate === null ? body.startDate : null,
        boxes: sanitizeBoxes(body.boxes),
        boxNumByRoom: sanitizeBoxNumByRoom(body.boxNumByRoom),
        expenses: sanitizeExpenses(body.expenses),
        budgetLimit: sanitizeBudgetLimit(body.budgetLimit),
        updatedAt: new Date().toISOString(),
        updatedBy: typeof body.updatedBy === 'string' ? body.updatedBy.slice(0, 40) : null
      };
      await kv.set(STATE_KEY, incoming);
      res.status(200).json(incoming);
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('KV error:', err);
    res.status(500).json({ error: 'Storage error', detail: String(err && err.message || err) });
  }
}
