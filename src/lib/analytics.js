const KEY = 'kamal-portfolio-events';
const SESSION_KEY = 'kamal-portfolio-session';
const NOTIFY_EVENTS = new Set(['project_open', 'project_link_click', 'resume_download_click', 'resume_download', 'map_node_open']);

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (_) { return 'local-session'; }
}

export function track(event, payload = {}) {
  const record = { event, payload: { ...payload, sessionId: payload.sessionId || getSessionId() }, path: location.pathname, at: new Date().toISOString() };
  let current = [];
  try {
    current = JSON.parse(localStorage.getItem(KEY) || '[]');
    current.push(record);
    localStorage.setItem(KEY, JSON.stringify(current.slice(-1000)));
  } catch (_) {}

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (endpoint) {
    try { navigator.sendBeacon(endpoint, new Blob([JSON.stringify(record)], { type: 'application/json' })); } catch (_) {}
  }

  if (NOTIFY_EVENTS.has(event)) {
    import('./notify').then(({ sendSessionEmail }) => {
      const sessionId = record.payload.sessionId;
      const sessionEvents = current.filter(e => e.payload?.sessionId === sessionId);
      sendSessionEmail(record, sessionEvents);
    }).catch(() => {});
  }
}

export function exportEvents() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } }
export function clearEvents() { try { localStorage.removeItem(KEY); } catch (_) {} }
export function getSessionIdForTesting() { return getSessionId(); }
