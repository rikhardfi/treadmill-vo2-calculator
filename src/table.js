import { formatMinutesToPace, parsePaceToMinutes } from './helpers.js';
import { computeVo2, computeKcal, computeElevation } from './model.js';
import {
  getSessionData, removeInterval, reorderIntervals, updateInterval, computeAggregates,
} from './session.js';
import { t } from './i18n.js';

let tableBody = null;
let summaryEls = null;
let getSettings = null; // callback to get current { bodyMassKg, economyPct }
let onDataChange = null; // callback fired after any data mutation

/**
 * Initialise the table module with DOM references and a settings getter.
 * @param {Function} [onDataChangeCb] - called after any data mutation (add/edit/delete/reorder)
 */
export function initTable(tbodyEl, summaryElements, settingsGetter, onDataChangeCb) {
  tableBody = tbodyEl;
  summaryEls = summaryElements;
  getSettings = settingsGetter;
  onDataChange = onDataChangeCb || null;
}

/**
 * Recalculate a single row from its inline inputs.
 */
function recalcRow(idx, speedEl, paceEl, inclineEl, durationEl, distanceEl, tr) {
  let s = parseFloat(speedEl.value);
  const p = parsePaceToMinutes(paceEl.value);
  if (!isFinite(s) || s <= 0) {
    if (isFinite(p) && p > 0) {
      s = 60 / p;
      speedEl.value = s.toFixed(2);
    } else return;
  }
  paceEl.value = formatMinutesToPace(60 / s);

  let inc = parseFloat(inclineEl.value || '0');
  if (!isFinite(inc)) inc = 0;

  let dur = parseFloat(durationEl.value);
  let dist = parseFloat(distanceEl.value);
  if (isFinite(dist) && dist > 0) {
    dur = (dist / s) * 60;
    durationEl.value = dur.toFixed(1);
  } else if (isFinite(dur) && dur > 0) {
    dist = s * (dur / 60);
    distanceEl.value = dist.toFixed(2);
  } else return;

  const { bodyMassKg, economyPct } = getSettings();
  const { vo2, mets } = computeVo2(s, inc, economyPct);
  const kcal = computeKcal(vo2, bodyMassKg, dur);
  const elev = computeElevation(dist, inc);

  updateInterval(idx, {
    speedKmh: s, paceMinPerKm: 60 / s, inclinePct: inc,
    durationMin: dur, distanceKm: dist, elevGainM: elev,
    vo2, mets, kcal,
  });

  tr.querySelector('.row-elev').textContent = elev.toFixed(0);
  tr.querySelector('.row-vo2').textContent = vo2.toFixed(1);
  tr.querySelector('.row-mets').textContent = mets.toFixed(1);
  tr.querySelector('.row-kcal').textContent = kcal.toFixed(0);
  updateSummary();
  if (onDataChange) onDataChange();
}

/**
 * Render (or re-render) the full table from session data.
 */
export function renderTable() {
  const data = getSessionData();
  tableBody.innerHTML = '';

  data.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.draggable = true;
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><input type="number" class="row-speed" value="${row.speedKmh.toFixed(1)}" step="0.1" min="0"></td>
      <td><input type="text" class="row-pace" value="${formatMinutesToPace(row.paceMinPerKm)}"></td>
      <td><input type="number" class="row-incline" value="${row.inclinePct.toFixed(1)}" step="0.1" min="0" max="25"></td>
      <td><input type="number" class="row-duration" value="${row.durationMin.toFixed(1)}" step="0.1" min="0"></td>
      <td><input type="number" class="row-distance" value="${row.distanceKm.toFixed(2)}" step="0.01" min="0"></td>
      <td class="row-elev">${(row.elevGainM || 0).toFixed(0)}</td>
      <td class="row-vo2">${row.vo2.toFixed(1)}</td>
      <td class="row-mets">${row.mets.toFixed(1)}</td>
      <td class="row-kcal">${row.kcal.toFixed(0)}</td>
      <td><button type="button" class="row-delete" aria-label="Delete interval ${idx + 1}">✕</button></td>`;
    tableBody.appendChild(tr);

    const speedEl = tr.querySelector('.row-speed');
    const paceEl = tr.querySelector('.row-pace');
    const inclineEl = tr.querySelector('.row-incline');
    const durationEl = tr.querySelector('.row-duration');
    const distanceEl = tr.querySelector('.row-distance');

    ['input', 'change'].forEach((ev) => {
      [speedEl, paceEl, inclineEl, durationEl, distanceEl].forEach((el) =>
        el.addEventListener(ev, () => recalcRow(idx, speedEl, paceEl, inclineEl, durationEl, distanceEl, tr)),
      );
    });

    tr.querySelector('.row-delete').addEventListener('click', () => {
      removeInterval(idx);
      renderTable();
      if (onDataChange) onDataChange();
    });
  });

  // Drag-and-drop reorder
  let dragStart = null;
  tableBody.querySelectorAll('tr').forEach((row, i) => {
    row.addEventListener('dragstart', (e) => {
      dragStart = i;
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      row.classList.add('row-drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('row-drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('row-drag-over');
      if (dragStart !== null && i !== dragStart) {
        reorderIntervals(dragStart, i);
        renderTable();
        if (onDataChange) onDataChange();
      }
    });
  });

  updateSummary();
}

/**
 * Update the summary footer row.
 */
export function updateSummary() {
  const a = computeAggregates();
  summaryEls.duration.textContent = a.totalDuration.toFixed(1);
  summaryEls.distance.textContent = a.totalDistance.toFixed(2);
  summaryEls.kcal.textContent = a.totalKcal.toFixed(0);
  summaryEls.elev.textContent = a.totalElev.toFixed(0);
  if (a.totalDuration > 0) {
    summaryEls.vo2.textContent = a.meanVo2.toFixed(1);
    summaryEls.mets.textContent = a.meanMets.toFixed(1);
    summaryEls.speed.textContent = a.meanSpeed.toFixed(1);
    summaryEls.pace.textContent = a.meanPaceDecimal > 0 ? formatMinutesToPace(a.meanPaceDecimal) : '0:00';
    summaryEls.incline.textContent = a.meanIncline.toFixed(1);
  } else {
    summaryEls.vo2.textContent = summaryEls.mets.textContent = summaryEls.speed.textContent = summaryEls.incline.textContent = '0.0';
    summaryEls.pace.textContent = '0:00';
  }
}

/**
 * Update table header labels for i18n.
 */
export function updateTableLabels() {
  const ids = {
    'th-speed': 'thSpeed', 'th-pace': 'thPace', 'th-incline': 'thIncline',
    'th-duration': 'thDuration', 'th-distance': 'thDistance', 'th-elevation': 'thElevation',
    'th-vo2': 'thVo2', 'th-mets': 'thMets', 'th-energy': 'thEnergy', 'th-totals': 'thTotals',
  };
  Object.entries(ids).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el) el.innerHTML = t(key);
  });
}
