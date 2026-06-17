// Vercel serverless function: GET/POST shared moving-helper state via Vercel KV.
// Requires a Vercel KV database connected to this project (env vars are auto-injected).

import { kv } from '@vercel/kv';

const STATE_KEY = 'moving_helper_state';

const DEFAULT_STATE = {
  done: [],
  moveDate: null,
  startDate: null,
  updatedAt: null,
  updatedBy: null
};

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
      res.status(200).json(stored || DEFAULT_STATE);
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      // Basic shape validation — don't trust the client blindly.
      const incoming = {
        done: Array.isArray(body.done) ? body.done.filter(x => typeof x === 'string') : [],
        moveDate: typeof body.moveDate === 'string' || body.moveDate === null ? body.moveDate : null,
        startDate: typeof body.startDate === 'string' || body.startDate === null ? body.startDate : null,
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
