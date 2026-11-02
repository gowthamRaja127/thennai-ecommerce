import type { EventType } from './schemas';

/*
 * First-party product engagement tracking. Events are batched and sent to /api/events,
 * which stores them in Supabase for the admin dashboard. No cookies and no personal data:
 * just an anonymous per-tab session id so a reload does not double-count a view.
 * Purchases are recorded by the server when payment is confirmed, not from the browser.
 */

type ClientEvent = Exclude<EventType, 'purchase'>;

interface PendingEvent {
  type: ClientEvent;
  productId: string;
  variant?: string;
  quantity?: number;
  source?: string;
  at: string;
}

const queue: PendingEvent[] = [];
const viewed = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;

function sessionId(): string {
  const make = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
  try {
    let id = sessionStorage.getItem('th-sid');
    if (!id) {
      id = make();
      sessionStorage.setItem('th-sid', id);
    }
    return id;
  } catch {
    return make();
  }
}

function flush() {
  timer = undefined;
  if (!queue.length) return;
  const body = JSON.stringify({ sessionId: sessionId(), events: queue.splice(0, 50) });
  const sent = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
  if (!sent) fetch('/api/events', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  if (queue.length) flush();
}

if (typeof window !== 'undefined') {
  addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
  addEventListener('pagehide', flush);
}

export function track(type: ClientEvent, productId: string, extra: Omit<PendingEvent, 'type' | 'productId' | 'at'> = {}) {
  if (type === 'product_view') {
    // One view per product per page session.
    const key = `${productId}:${location.pathname}`;
    if (viewed.has(key)) return;
    viewed.add(key);
  }
  queue.push({ type, productId, ...extra, at: new Date().toISOString() });
  timer ??= setTimeout(flush, 2000);
}
