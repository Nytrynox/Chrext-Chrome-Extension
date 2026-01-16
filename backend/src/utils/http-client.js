import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_MAX_RETRIES = Number(process.env.OUTBOUND_MAX_RETRIES || 3);
const DEFAULT_INITIAL_BACKOFF_MS = Number(process.env.OUTBOUND_INITIAL_BACKOFF_MS || 500);
const DEFAULT_TIMEOUT_MS = Number(process.env.OUTBOUND_TIMEOUT_MS || 30000);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBackoffDelay(attempt, initial) {
  const base = initial * Math.pow(2, attempt);
  // Full jitter
  return Math.floor(Math.random() * base);
}

function parseRetryAfter(header) {
  if (!header) return null;
  const secs = Number(header);
  if (!Number.isNaN(secs) && secs >= 0) return secs * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    const diff = date - Date.now();
    return diff > 0 ? diff : null;
  }
  return null;
}

export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    initialBackoffMs = DEFAULT_INITIAL_BACKOFF_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryOn = [429, 500, 502, 503, 504],
  } = retryOptions;

  let attempt = 0;
  let lastErr;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      if (retryOn.includes(res.status)) {
        if (attempt === maxRetries) return res; // let caller handle final non-OK

        const retryAfterHeader = res.headers?.get?.('retry-after');
        const retryAfterMs = parseRetryAfter(retryAfterHeader);
        const delay = retryAfterMs ?? getBackoffDelay(attempt, initialBackoffMs);
        logger.warn(`fetchWithRetry: ${url} returned ${res.status}. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}).`);
        await sleep(delay);
        attempt++;
        continue;
      }

      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      const isAbort = err?.name === 'AbortError';
      // Network errors or timeouts: retry
      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt, initialBackoffMs);
        logger.warn(`fetchWithRetry: error on ${url}: ${err?.message || err}. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}).`);
        await sleep(delay);
        attempt++;
        continue;
      }
      throw err;
    }
  }

  throw lastErr || new Error('fetchWithRetry: unknown error');
}

export async function jsonFetchWithRetry(url, options = {}, retryOptions = {}) {
  const res = await fetchWithRetry(url, options, retryOptions);
  // If not ok and not retried further, throw with body detail if available
  if (!res.ok) {
    let body;
    try { body = await res.text(); } catch { /* noop */ }
    const msg = `HTTP ${res.status} ${res.statusText}${body ? `: ${body}` : ''}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
