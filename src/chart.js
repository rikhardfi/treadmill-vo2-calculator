import { getSessionData } from './session.js';
import { t } from './i18n.js';

let canvas = null;
let ctx = null;

/**
 * Initialise the chart module with a canvas element.
 */
export function initChart(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
}

/**
 * Draw the elevation profile chart based on session data.
 * Shows cumulative distance on x-axis, elevation gain on y-axis,
 * with segment colours indicating VO₂ intensity.
 */
export function updateElevationChart() {
  if (!canvas || !ctx) return;

  const data = getSessionData();
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width;
  const h = 200;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);

  // Clear
  ctx.clearRect(0, 0, w, h);

  if (data.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('chartEmpty') || 'Add intervals to see elevation profile', w / 2, h / 2);
    return;
  }

  // Build cumulative segments
  const segments = [];
  let cumDist = 0;
  let cumElev = 0;
  segments.push({ dist: 0, elev: 0 });
  data.forEach((row) => {
    cumDist += row.distanceKm;
    cumElev += row.elevGainM || 0;
    segments.push({ dist: cumDist, elev: cumElev, vo2: row.vo2 });
  });

  const maxDist = cumDist || 1;
  const maxElev = Math.max(cumElev, 10);

  // Layout
  const pad = { top: 20, right: 20, bottom: 35, left: 50 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const xScale = (d) => pad.left + (d / maxDist) * plotW;
  const yScale = (e) => pad.top + plotH - (e / maxElev) * plotH;

  // Axes
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Y-axis ticks
  ctx.fillStyle = '#666';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'right';
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const val = (maxElev / yTicks) * i;
    const y = yScale(val);
    ctx.fillText(val.toFixed(0) + ' m', pad.left - 6, y + 4);
    if (i > 0) {
      ctx.strokeStyle = '#eee';
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
    }
  }

  // X-axis ticks
  ctx.textAlign = 'center';
  ctx.fillStyle = '#666';
  const xTicks = Math.min(data.length + 1, 10);
  for (let i = 0; i <= xTicks; i++) {
    const val = (maxDist / xTicks) * i;
    const x = xScale(val);
    ctx.fillText(val.toFixed(1) + ' km', x, pad.top + plotH + 18);
  }

  // Draw segments with VO₂-based color
  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    const cur = segments[i];
    const vo2 = cur.vo2 || 0;

    // Color: green (low VO₂) → yellow → red (high VO₂)
    const intensity = Math.min(vo2 / 70, 1);
    const r = Math.round(intensity * 220 + (1 - intensity) * 50);
    const g = Math.round((1 - Math.abs(intensity - 0.5) * 2) * 180 + 50);
    const b = Math.round((1 - intensity) * 150 + 30);
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(xScale(prev.dist), yScale(prev.elev));
    ctx.lineTo(xScale(cur.dist), yScale(cur.elev));
    ctx.stroke();

    // Point
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(xScale(cur.dist), yScale(cur.elev), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fill under the line
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#235787';
  ctx.beginPath();
  ctx.moveTo(xScale(0), yScale(0));
  segments.forEach((seg) => ctx.lineTo(xScale(seg.dist), yScale(seg.elev)));
  ctx.lineTo(xScale(cumDist), yScale(0));
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Get the canvas element for export (e.g. copying to clipboard).
 */
export function getCanvas() {
  return canvas;
}
