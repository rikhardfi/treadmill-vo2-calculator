/**
 * Parse a locale-flexible float (accepts both comma and dot as decimal separator).
 */
export function parseLocaleFloat(value) {
  if (value == null) return NaN;
  const s = String(value).trim().replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) ? n : NaN;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Parse a pace string like "4:30" or a plain number (minutes per km) → decimal minutes.
 */
export function parsePaceToMinutes(value) {
  if (!value) return NaN;
  const s = String(value).trim();
  if (!s) return NaN;
  if (s.includes(':')) {
    const [m, sec] = s.split(':');
    const min = parseInt(m, 10);
    const secs = parseInt(sec, 10);
    return (isFinite(min) && isFinite(secs) && secs >= 0 && secs < 60)
      ? min + secs / 60
      : NaN;
  }
  const n = parseFloat(s);
  return (isFinite(n) && n > 0) ? n : NaN;
}

/**
 * Format decimal minutes to "m:ss" pace string.
 */
export function formatMinutesToPace(mins) {
  if (!isFinite(mins) || mins <= 0) return '';
  const totalSecs = Math.round(mins * 60);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

/**
 * Build a safe filename from a session name.
 */
export function safeName(name) {
  return (name || 'treadmill_session')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '') || 'treadmill_session';
}
