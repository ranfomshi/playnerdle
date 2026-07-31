export const INTERNAL_TRAFFIC_KEY = 'bludle:internal-traffic:v1';

function readPreference(storage) {
  try { return storage?.getItem(INTERNAL_TRAFFIC_KEY) === '1'; } catch { return false; }
}

function updatePreference(search, storage) {
  let preference = null;
  try { preference = new URLSearchParams(search || '').get('internal'); } catch { /* Ignore malformed URLs. */ }

  try {
    if (preference === '1') storage?.setItem(INTERNAL_TRAFFIC_KEY, '1');
    if (preference === '0') storage?.removeItem(INTERNAL_TRAFFIC_KEY);
  } catch { /* Storage can be unavailable. */ }
}

export function resolveAnalyticsPolicy({ location, storage }) {
  updatePreference(location?.search, storage);

  const protocol = (location?.protocol || '').toLowerCase();
  const hostname = (location?.hostname || '').toLowerCase();
  const localHost = protocol === 'file:' || hostname === 'localhost' || hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '[::1]';
  const previewHost = hostname.endsWith('.netlify.app');
  const internalTraffic = readPreference(storage);
  const reason = localHost ? 'local' : previewHost ? 'preview' : internalTraffic ? 'internal' : null;

  return Object.freeze({
    disabled: Boolean(reason),
    reason,
    internalTraffic
  });
}
