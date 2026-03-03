import { formatMinutesToPace, safeName } from './helpers.js';
import { getSessionData, computeAggregates } from './session.js';
import { t, getLanguage } from './i18n.js';
import { getCanvas } from './chart.js';

/**
 * Build a plain-text session summary.
 */
export function buildSessionText(sessionNameVal, bodyMassKg, economyPct) {
  const year = new Date().getFullYear();
  const name = (sessionNameVal || '').trim() || 'Unnamed treadmill session';
  const data = getSessionData();
  const agg = computeAggregates();

  const lines = [
    `Session: ${name}`,
    `Body mass: ${bodyMassKg.toFixed(1)} kg`,
    `Running economy: ${economyPct.toFixed(0)} % of typical`,
    '',
    'Intervals (tab-separated):',
    'Index\tSpeed_km/h\tPace_min/km\tIncline_%\tDuration_min\tDistance_km\tElevation_m\tVO2_mL/kg/min\tMETs\tEnergy_kcal',
  ];
  data.forEach((r, i) =>
    lines.push([
      i + 1, r.speedKmh.toFixed(2), formatMinutesToPace(r.paceMinPerKm),
      r.inclinePct.toFixed(1), r.durationMin.toFixed(2), r.distanceKm.toFixed(3),
      (r.elevGainM || 0).toFixed(0), r.vo2.toFixed(1), r.mets.toFixed(1), r.kcal.toFixed(0),
    ].join('\t')),
  );
  lines.push(
    '', 'Totals and means:',
    `Total duration (min):\t${agg.totalDuration.toFixed(1)}`,
    `Total distance (km):\t${agg.totalDistance.toFixed(2)}`,
    `Total elevation (m):\t${agg.totalElev.toFixed(0)}`,
    `Mean speed (km/h):\t${agg.meanSpeed.toFixed(1)}`,
    `Mean pace (min/km):\t${agg.meanPaceDecimal > 0 ? formatMinutesToPace(agg.meanPaceDecimal) : '0:00'}`,
    `Mean incline (%):\t${agg.meanIncline.toFixed(1)}`,
    `Mean VO2 (mL/kg/min):\t${agg.meanVo2.toFixed(1)}`,
    `Mean METs:\t${agg.meanMets.toFixed(1)}`,
    `Total energy (kcal):\t${agg.totalKcal.toFixed(0)}`,
  );
  lines.push(
    '',
    'Background: VO₂ estimated from treadmill running speed and incline, adjusted by the running economy slider.',
    'Energy expenditure estimated assuming approximately 5 kcal per litre of oxygen consumed.',
    '',
    `© Rikhard Mäki-Heikkilä – rikhard.fi/calculators – ${year}`,
  );
  return lines.join('\n');
}

/**
 * Download a file.
 */
function downloadFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download session as TXT.
 */
export function downloadTxt(sessionNameVal, bodyMassKg, economyPct) {
  const data = getSessionData();
  if (!data.length) { alert(t('alertAddInterval')); return; }
  downloadFile(
    buildSessionText(sessionNameVal, bodyMassKg, economyPct),
    safeName(sessionNameVal) + '.txt',
  );
}

/**
 * Copy session text to clipboard.
 */
export function copyTxtToClipboard(sessionNameVal, bodyMassKg, economyPct) {
  const data = getSessionData();
  if (!data.length) { alert(t('alertAddInterval')); return; }
  const text = buildSessionText(sessionNameVal, bodyMassKg, economyPct);

  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); alert(t('alertCopied')); }
    catch { alert(t('alertCopyFailed')); }
    document.body.removeChild(ta);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => alert(t('alertCopied')))
      .catch(fallback);
  } else {
    fallback();
  }
}

/**
 * Copy the elevation chart (canvas) to clipboard.
 */
export function copyPlotToClipboard() {
  const canvas = getCanvas();
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]).catch(() => alert(t('alertCopyFailed')));
  });
}

/**
 * Download session as XLSX.
 */
export async function downloadXlsx(sessionNameVal, bodyMassKg, economyPct) {
  const data = getSessionData();
  if (!data.length) { alert(t('alertAddInterval')); return; }

  let XLSX;
  try {
    XLSX = await import('xlsx');
  } catch {
    alert(t('alertXlsxUnavailable'));
    return;
  }

  const name = (sessionNameVal || '').trim() || 'Treadmill session';
  const year = new Date().getFullYear();
  const agg = computeAggregates();

  const meta = [
    ['Session', name],
    ['Body mass (kg)', bodyMassKg.toFixed(1)],
    ['Running economy (%)', economyPct.toFixed(0)],
    ['Total duration (min)', agg.totalDuration.toFixed(1)],
    ['Total distance (km)', agg.totalDistance.toFixed(2)],
    ['Total elevation (m)', agg.totalElev.toFixed(0)],
    ['Mean speed (km/h)', agg.meanSpeed.toFixed(1)],
    ['Mean pace (min/km)', agg.meanPaceDecimal > 0 ? formatMinutesToPace(agg.meanPaceDecimal) : '0:00'],
    ['Mean incline (%)', agg.meanIncline.toFixed(1)],
    ['Mean VO2 (mL/kg/min)', agg.meanVo2.toFixed(1)],
    ['Mean METs', agg.meanMets.toFixed(1)],
    ['Total energy (kcal)', agg.totalKcal.toFixed(0)],
    [],
    ['Background'],
    ['VO2 estimated from treadmill running speed and incline, adjusted by the running economy slider.'],
    ['Energy expenditure estimated assuming approximately 5 kcal per litre of oxygen consumed.'],
    [],
    [`© Rikhard Mäki-Heikkilä – rikhard.fi/calculators – ${year}`],
  ];

  const intervals = [
    ['#', 'Speed (km/h)', 'Pace (min/km)', 'Incline (%)', 'Duration (min)', 'Distance (km)', 'Elevation (m)', 'VO2 (mL/kg/min)', 'METs', 'Energy (kcal)'],
  ];
  data.forEach((r, i) =>
    intervals.push([
      i + 1, r.speedKmh, formatMinutesToPace(r.paceMinPerKm), r.inclinePct,
      r.durationMin, r.distanceKm, r.elevGainM || 0, r.vo2, r.mets, r.kcal,
    ]),
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(meta), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(intervals), 'Intervals');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = safeName(name) + '.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download session as PDF.
 */
export async function downloadPdf(sessionNameVal, bodyMassKg, economyPct) {
  const data = getSessionData();
  if (!data.length) { alert(t('alertAddInterval')); return; }

  let jsPDF;
  try {
    const mod = await import('jspdf');
    jsPDF = mod.jsPDF || mod.default;
  } catch {
    alert(t('alertPdfUnavailable'));
    return;
  }

  // Load autotable plugin
  try {
    await import('jspdf-autotable');
  } catch {
    // Continue without autotable — fall back to text-based PDF
  }

  const name = (sessionNameVal || '').trim() || 'Treadmill session';
  const year = new Date().getFullYear();
  const agg = computeAggregates();

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 15, 20);

  // Settings
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 30;
  doc.text(`Body mass: ${bodyMassKg.toFixed(1)} kg`, 15, y); y += 5;
  doc.text(`Running economy: ${economyPct.toFixed(0)} % of typical`, 15, y); y += 10;

  // Intervals table (using autoTable if available)
  if (typeof doc.autoTable === 'function') {
    doc.autoTable({
      startY: y,
      head: [['#', 'Speed\n(km/h)', 'Pace\n(min/km)', 'Incline\n(%)', 'Duration\n(min)', 'Distance\n(km)', 'Elev.\n(m)', 'VO₂\n(mL/kg/min)', 'METs', 'Energy\n(kcal)']],
      body: data.map((r, i) => [
        i + 1, r.speedKmh.toFixed(1), formatMinutesToPace(r.paceMinPerKm),
        r.inclinePct.toFixed(1), r.durationMin.toFixed(1), r.distanceKm.toFixed(2),
        (r.elevGainM || 0).toFixed(0), r.vo2.toFixed(1), r.mets.toFixed(1), r.kcal.toFixed(0),
      ]),
      foot: [[
        'Total/Mean', agg.meanSpeed.toFixed(1),
        agg.meanPaceDecimal > 0 ? formatMinutesToPace(agg.meanPaceDecimal) : '0:00',
        agg.meanIncline.toFixed(1), agg.totalDuration.toFixed(1), agg.totalDistance.toFixed(2),
        agg.totalElev.toFixed(0), agg.meanVo2.toFixed(1), agg.meanMets.toFixed(1), agg.totalKcal.toFixed(0),
      ]],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [35, 87, 135] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    // Fallback: text-based table
    const text = buildSessionText(sessionNameVal, bodyMassKg, economyPct);
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    text.split('\n').forEach((line) => {
      doc.splitTextToSize(line, 180).forEach((wline) => {
        if (y > 285) { doc.addPage(); y = 15; }
        doc.text(wline, 15, y);
        y += 4;
      });
    });
  }

  // Background note
  if (y > 260) { doc.addPage(); y = 15; }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('VO₂ estimated from treadmill running speed and incline, adjusted by running economy.', 15, y); y += 4;
  doc.text('Energy: ~5 kcal per litre of O₂ consumed.', 15, y); y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`© Rikhard Mäki-Heikkilä – rikhard.fi/calculators – ${year}`, 15, y);

  doc.save(safeName(sessionNameVal) + '.pdf');
}
