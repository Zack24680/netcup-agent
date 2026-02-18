/**
 * SQLite store — persists across restarts.
 * Uses better-sqlite3 (synchronous API, zero-config, single file).
 * DB file: data/hypno.db (created automatically, gitignored).
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../../data/hypno.db');

// Ensure data directory exists
mkdirSync(join(__dirname, '../../../data'), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    email      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scripts (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    symptoms   TEXT NOT NULL,  -- JSON array stored as string
    tone       TEXT NOT NULL,
    duration   INTEGER NOT NULL,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
`);

// ── Helpers ───────────────────────────────────────────────────────────────────
function rowToScript(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    symptoms: JSON.parse(row.symptoms),
    tone: row.tone,
    duration: row.duration,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Prepared statements ───────────────────────────────────────────────────────
const stmts = {
  insertUser: db.prepare(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)'
  ),
  findUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findUserById:    db.prepare('SELECT * FROM users WHERE id = ?'),

  insertScript: db.prepare(`
    INSERT INTO scripts (id, user_id, title, symptoms, tone, duration, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  listScripts: db.prepare(
    'SELECT * FROM scripts WHERE user_id = ? ORDER BY created_at DESC'
  ),
  getScript: db.prepare(
    'SELECT * FROM scripts WHERE id = ? AND user_id = ?'
  ),
  deleteScript: db.prepare(
    'DELETE FROM scripts WHERE id = ? AND user_id = ?'
  ),
};

// ── User ──────────────────────────────────────────────────────────────────────
export function createUser({ email, passwordHash }) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  stmts.insertUser.run(id, email, passwordHash, createdAt);
  return { id, email, passwordHash, createdAt };
}

export function findUserByEmail(email) {
  const row = stmts.findUserByEmail.get(email);
  if (!row) return null;
  return { id: row.id, email: row.email, passwordHash: row.password_hash, createdAt: row.created_at };
}

export function findUserById(id) {
  const row = stmts.findUserById.get(id);
  if (!row) return null;
  return { id: row.id, email: row.email, passwordHash: row.password_hash, createdAt: row.created_at };
}

// ── Scripts ───────────────────────────────────────────────────────────────────
export function saveScript({ userId, title, symptoms, tone, duration, content }) {
  const id = randomUUID();
  const now = new Date().toISOString();
  stmts.insertScript.run(id, userId, title, JSON.stringify(symptoms), tone, duration, content, now, now);
  return { id, userId, title, symptoms, tone, duration, content, createdAt: now, updatedAt: now };
}

export function listScripts(userId) {
  return stmts.listScripts.all(userId).map(rowToScript);
}

export function getScript(userId, scriptId) {
  return rowToScript(stmts.getScript.get(scriptId, userId));
}

export function deleteScript(userId, scriptId) {
  const result = stmts.deleteScript.run(scriptId, userId);
  return result.changes > 0;
}
