/**
 * In-memory store — swap for a real DB (SQLite/Postgres) later.
 * Shape matches the API contracts in handover.md.
 */

import { randomUUID } from 'crypto';

const users = new Map();    // id → User
const sessions = new Map(); // id → Script[]

// ── User ──────────────────────────────────────────────────────────────────────
export function createUser({ email, passwordHash }) {
  const id = randomUUID();
  const user = { id, email, passwordHash, createdAt: new Date().toISOString() };
  users.set(id, user);
  return user;
}

export function findUserByEmail(email) {
  return [...users.values()].find(u => u.email === email) ?? null;
}

export function findUserById(id) {
  return users.get(id) ?? null;
}

// ── Scripts ───────────────────────────────────────────────────────────────────
export function saveScript({ userId, title, symptoms, tone, duration, content }) {
  const script = {
    id: randomUUID(),
    userId,
    title,
    symptoms,
    tone,
    duration,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const list = sessions.get(userId) ?? [];
  list.unshift(script);
  sessions.set(userId, list);
  return script;
}

export function listScripts(userId) {
  return sessions.get(userId) ?? [];
}

export function getScript(userId, scriptId) {
  return (sessions.get(userId) ?? []).find(s => s.id === scriptId) ?? null;
}

export function deleteScript(userId, scriptId) {
  const list = sessions.get(userId) ?? [];
  const idx = list.findIndex(s => s.id === scriptId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  sessions.set(userId, list);
  return true;
}
