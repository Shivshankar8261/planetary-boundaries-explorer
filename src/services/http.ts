/**
 * Small fetch helper with a timeout and a two-level cache:
 * in-memory for the session and localStorage (with TTL) across reloads.
 */
const memory = new Map<string, { at: number; data: unknown }>();
const PREFIX = 'pb-cache:';

export interface CachedResult<T> {
  data: T;
  fromCache: boolean;
  fetchedAt: number;
}

function readStore<T>(key: string, ttl: number): { at: number; data: T } | null {
  const mem = memory.get(key);
  if (mem && Date.now() - mem.at < ttl) return mem as { at: number; data: T };
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: T };
    if (Date.now() - parsed.at < ttl) {
      memory.set(key, parsed);
      return parsed;
    }
  } catch {
    /* storage unavailable (private mode etc.) — ignore */
  }
  return null;
}

function writeStore(key: string, data: unknown) {
  const entry = { at: Date.now(), data };
  memory.set(key, entry);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota or disabled — memory cache still works */
  }
}

export async function fetchText(url: string, init: RequestInit = {}, timeoutMs = 10000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/** Run `loader` unless a fresh cached value exists for `key`. */
export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<CachedResult<T>> {
  const hit = readStore<T>(key, ttlMs);
  if (hit) return { data: hit.data, fromCache: true, fetchedAt: hit.at };
  const data = await loader();
  writeStore(key, data);
  return { data, fromCache: false, fetchedAt: Date.now() };
}

export const DAY = 24 * 60 * 60 * 1000;
