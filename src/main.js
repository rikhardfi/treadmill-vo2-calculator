import './style.css';
import { parsePaceToMinutes, formatMinutesToPace } from './helpers.js';
import { computeVo2, computeKcal, computeElevation, solveSpeedForVo2, solveInclineForVo2, getEconomyCategory } from './model.js';
import { t, getLanguage, toggleLanguage } from './i18n.js';
import { addInterval, getSessionData, getSessionLength, recomputeAllRows } from './session.js';
import { initTable, renderTable, updateSummary, updateTableLabels } from './table.js';
import { updateElevationChart, initChart } from './chart.js';
import { downloadTxt, copyTxtToClipboard, copyPlotToClipboard, downloadXlsx, downloadPdf } from './export.js';

// DOM references
const els = {
  bodyMass: document.getElementById('body-mass'),
  economy: document.getElementById('economy'),
  economyDisplay: document.getElementById('economy-display'),
  economyLabel: document.getElementById('economy-label'),
  speed: document.getElementById('speed'),
  pace: document.getElementById('pace'),
  incline: document.getElementById('incline'),
  duration: document.getElementById('duration'),
  distance: document.getElementById('distance'),
  vo2: document.getElementById('vo2'),
  vo2Btn: document.getElementById('vo2-from-inputs'),
  solveMode: document.getElementById('solve-mode'),
  solveBtn: document.getElementById('solve-btn'),
  addBtn: document.getElementById('add-interval'),
  sessionBody: document.getElementById('session-body'),
  sessionName: document.getElementById('session-name'),
  langToggle: document.getElementById('lang-toggle'),
  helpToggle: document.getElementById('help-toggle'),
  helpPanel: document.getElementById('help-panel'),
  helpContent: document.getElementById('help-content'),
  yearSpan: document.getElementById('current-year'),
  canvas: document.getElementById('elevation-chart'),
};

// Summary footer elements
const summaryEls = {
  speed: document.getElementById('sum-speed'),
  pace: document.getElementById('sum-pace'),
  incline: document.getElementById('sum-incline'),
  duration: document.getElementById('sum-duration'),
  distance: document.getElementById('sum-distance'),
  elev: document.getElementById('sum-elev'),
  vo2: document.getElementById('sum-vo2'),
  mets: document.getElementById('sum-mets'),
  kcal: document.getElementById('sum-kcal'),
};

/** Get current settings. */
function getSettings() {
  return {
    bodyMassKg: parseFloat(els.bodyMass.value) || 70,
    economyPct: parseFloat(els.economy.value) || 100,
  };
}

/** Get current speed from speed or pace input. */
function getSpeed() {
  let s = parseFloat(els.speed.value);
  if (!isFinite(s) || s <= 0) {
    const p = parsePaceToMinutes(els.pace.value);
    if (isFinite(p) && p > 0) s = 60 / p;
  }
  return s;
}

/** Get export params. */
function getExportParams() {
  const { bodyMassKg, economyPct } = getSettings();
  return [els.sessionName.value, bodyMassKg, economyPct];
}

// ——— Economy slider ———
els.economy.addEventListener('input', () => {
  const v = parseInt(els.economy.value, 10) || 100;
  els.economyDisplay.textContent = v + '%';
  els.economyLabel.textContent = t(getEconomyCategory(v));

  // Recompute all rows when economy changes
  if (getSessionLength() > 0) {
    const { bodyMassKg } = getSettings();
    recomputeAllRows(bodyMassKg, v);
    renderTable();
    updateElevationChart();
  }
});

// Also recompute when body mass changes
els.bodyMass.addEventListener('change', () => {
  if (getSessionLength() > 0) {
    const { bodyMassKg, economyPct } = getSettings();
    recomputeAllRows(bodyMassKg, economyPct);
    renderTable();
    updateElevationChart();
  }
});

// ——— Speed/pace sync ———
els.speed.addEventListener('input', () => {
  const s = parseFloat(els.speed.value);
  if (isFinite(s) && s > 0) els.pace.value = formatMinutesToPace(60 / s);
});

els.pace.addEventListener('input', () => {
  const p = parsePaceToMinutes(els.pace.value);
  if (isFinite(p) && p > 0 && !els.speed.value) els.speed.value = (60 / p).toFixed(2);
});

// ——— VO₂ preview button ———
els.vo2Btn.addEventListener('click', () => {
  const s = getSpeed();
  if (!isFinite(s) || s <= 0) { alert(t('alertEnterSpeed')); return; }
  const { economyPct } = getSettings();
  els.vo2.value = computeVo2(s, parseFloat(els.incline.value || '0'), economyPct).vo2.toFixed(1);
});

// ——— Solve button ———
els.solveBtn.addEventListener('click', () => {
  const mode = els.solveMode.value;
  const { economyPct } = getSettings();
  let s = getSpeed();

  // Try to get speed from pace if speed field is empty
  if (!isFinite(s) || s <= 0) {
    const p = parsePaceToMinutes(els.pace.value);
    if (isFinite(p) && p > 0) {
      s = 60 / p;
      els.speed.value = s.toFixed(2);
    }
  }

  let inc = parseFloat(els.incline.value || '0');
  let vo2t = parseFloat(els.vo2.value);

  if (mode === 'vo2') {
    if (!isFinite(s) || s <= 0 || !isFinite(inc)) { alert(t('alertEnterSpeedIncline')); return; }
    els.vo2.value = computeVo2(s, inc, economyPct).vo2.toFixed(1);
    return;
  }

  if (!isFinite(vo2t) || vo2t <= 0) { alert(t('alertEnterVo2')); return; }

  if (mode === 'speed') {
    const result = solveSpeedForVo2(vo2t, inc, economyPct);
    if (result === null) { alert(t('alertCannotSolveSpeed')); return; }
    s = result;
    els.speed.value = s.toFixed(2);
    els.pace.value = formatMinutesToPace(60 / s);
  } else if (mode === 'incline') {
    if (!isFinite(s) || s <= 0) { alert(t('alertEnterSpeed')); return; }
    const result = solveInclineForVo2(vo2t, s, economyPct);
    if (result === null) { alert(t('alertNegativeIncline')); return; }
    inc = result;
    els.incline.value = inc.toFixed(1);
  }

  // Update VO₂ display after solve
  if (isFinite(s) && s > 0) {
    els.vo2.value = computeVo2(s, parseFloat(els.incline.value || '0'), economyPct).vo2.toFixed(1);
  }
});

// ——— Add interval ———
els.addBtn.addEventListener('click', () => {
  const s = getSpeed();
  if (!isFinite(s) || s <= 0) { alert(t('alertEnterSpeedOrPace')); return; }

  const inc = parseFloat(els.incline.value || '0');
  let dur = parseFloat(els.duration.value);
  let dist = parseFloat(els.distance.value);

  if (isFinite(dist) && dist > 0) {
    dur = (dist / s) * 60;
  } else if (isFinite(dur) && dur > 0) {
    dist = s * (dur / 60);
  } else {
    alert(t('alertEnterDuration'));
    return;
  }

  const { bodyMassKg, economyPct } = getSettings();
  const { vo2, mets } = computeVo2(s, inc, economyPct);
  const kcal = computeKcal(vo2, bodyMassKg, dur);
  const elev = computeElevation(dist, inc);

  addInterval({
    speedKmh: s, paceMinPerKm: 60 / s, inclinePct: inc || 0,
    durationMin: dur, distanceKm: dist, elevGainM: elev,
    vo2, mets, kcal,
  });

  renderTable();
  updateElevationChart();
});

// ——— Export buttons ———
document.getElementById('btn-download-txt').addEventListener('click', () => downloadTxt(...getExportParams()));
document.getElementById('btn-copy-txt').addEventListener('click', () => copyTxtToClipboard(...getExportParams()));
document.getElementById('btn-download-xlsx').addEventListener('click', () => downloadXlsx(...getExportParams()));
document.getElementById('btn-download-pdf').addEventListener('click', () => downloadPdf(...getExportParams()));

// ——— Language toggle ———
els.langToggle.addEventListener('click', () => {
  toggleLanguage();
  updateAllText();
  renderTable();
  updateElevationChart();
});

// ——— Help toggle ———
els.helpToggle.addEventListener('click', () => {
  els.helpPanel.classList.toggle('open');
});

/** Update all translatable text in the UI. */
function updateAllText() {
  // Header
  document.getElementById('app-title').textContent = t('title');
  document.getElementById('app-subtitle').textContent = t('subtitle');
  els.langToggle.textContent = t('languageToggle');

  // Section headings
  document.getElementById('section-athlete').textContent = t('sectionAthlete');
  document.getElementById('section-interval').textContent = t('sectionInterval');
  document.getElementById('section-session').textContent = t('sectionSession');

  // Athlete settings
  document.getElementById('label-body-mass').textContent = t('labelBodyMass');
  document.getElementById('label-economy').textContent = t('labelEconomy');
  document.getElementById('economy-hint').textContent = t('economyHint');
  document.getElementById('economy-scale').textContent = t('economyScale');
  els.economyLabel.textContent = t(getEconomyCategory(parseInt(els.economy.value, 10) || 100));

  // Interval settings
  document.getElementById('label-speed').textContent = t('labelSpeed');
  document.getElementById('label-or-pace').textContent = t('labelOrPace');
  document.getElementById('label-pace').textContent = t('labelPace');
  document.getElementById('label-incline').textContent = t('labelIncline');
  document.getElementById('label-duration').textContent = t('labelDuration');
  document.getElementById('label-or').textContent = t('labelOr');
  document.getElementById('label-distance').textContent = t('labelDistance');
  document.getElementById('label-fill-either').textContent = t('labelFillEither');
  document.getElementById('label-vo2').textContent = t('labelVo2');
  document.getElementById('vo2-hint').textContent = t('vo2Hint');
  document.getElementById('label-solve').textContent = t('labelSolve');
  document.getElementById('solve-hint').textContent = t('solveHint');

  // Solve options
  document.getElementById('solve-opt-vo2').textContent = t('solveOptVo2');
  document.getElementById('solve-opt-speed').textContent = t('solveOptSpeed');
  document.getElementById('solve-opt-incline').textContent = t('solveOptIncline');

  // Buttons
  els.vo2Btn.textContent = t('btnUseSpeed');
  els.solveBtn.textContent = t('btnSolve');
  els.addBtn.textContent = t('btnAdd');
  document.getElementById('btn-download-txt').textContent = t('btnDownloadTxt');
  document.getElementById('btn-copy-txt').textContent = t('btnCopyTxt');
  document.getElementById('btn-download-xlsx').textContent = t('btnDownloadXlsx');
  document.getElementById('btn-download-pdf').textContent = t('btnDownloadPdf');

  // Session
  document.getElementById('label-session-name').textContent = t('labelSessionName');
  els.sessionName.placeholder = t('sessionNamePlaceholder');
  document.getElementById('export-note').innerHTML = t('exportNote') + ' ' + new Date().getFullYear() + '.';

  // Table headers
  updateTableLabels();

  // Help panel
  renderHelp();
}

/** Render the help content based on current language. */
function renderHelp() {
  const steps = t('helpSteps');
  const bg = t('helpBackground');
  const fiTitle = t('helpFinnishTitle');
  const fiSteps = t('helpFinnishSteps');

  let html = `<h3>${t('helpTitle')}</h3><ol>`;
  steps.forEach((s) => (html += `<li>${s}</li>`));
  html += '</ol>';

  html += `<h4>${t('helpBackgroundTitle')}</h4>`;
  bg.forEach((p) => (html += `<p>${p}</p>`));

  if (fiTitle && fiSteps.length) {
    html += `<hr><h4>${fiTitle}</h4><ul>`;
    fiSteps.forEach((s) => (html += `<li>${s}</li>`));
    html += '</ul>';
  }

  els.helpContent.innerHTML = html;
}

/** Initialise the app. */
function init() {
  // Year
  if (els.yearSpan) els.yearSpan.textContent = new Date().getFullYear();

  // Init table module
  initTable(els.sessionBody, summaryEls, getSettings);

  // Init chart
  const canvasEl = document.getElementById('elevation-chart');
  if (canvasEl) initChart(canvasEl);

  // Fire economy display
  els.economy.dispatchEvent(new Event('input'));

  // Set initial text
  updateAllText();
}

document.addEventListener('DOMContentLoaded', init);
