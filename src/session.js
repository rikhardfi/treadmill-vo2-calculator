import { formatMinutesToPace } from './helpers.js';
import { computeVo2, computeKcal, computeElevation } from './model.js';

/**
 * Session data — array of interval objects.
 */
const sessionData = [];

export function getSessionData() {
  return sessionData;
}

export function getSessionLength() {
  return sessionData.length;
}

/**
 * Add an interval to the session.
 */
export function addInterval(interval) {
  sessionData.push(interval);
}

/**
 * Remove an interval by index.
 */
export function removeInterval(index) {
  sessionData.splice(index, 1);
}

/**
 * Reorder: move item from fromIndex to toIndex.
 */
export function reorderIntervals(fromIndex, toIndex) {
  sessionData.splice(toIndex, 0, sessionData.splice(fromIndex, 1)[0]);
}

/**
 * Update an interval at a given index.
 */
export function updateInterval(index, data) {
  sessionData[index] = data;
}

/**
 * Recompute VO₂, METs, kcal, elevation for all rows given current settings.
 */
export function recomputeAllRows(bodyMassKg, economyPct) {
  sessionData.forEach((row) => {
    const { vo2, mets } = computeVo2(row.speedKmh, row.inclinePct, economyPct);
    row.vo2 = vo2;
    row.mets = mets;
    row.kcal = computeKcal(vo2, bodyMassKg, row.durationMin);
    row.elevGainM = computeElevation(row.distanceKm, row.inclinePct);
  });
}

/**
 * Compute aggregates for the current session.
 */
export function computeAggregates() {
  let td = 0, tdist = 0, tk = 0, te = 0, vtw = 0, itw = 0;
  sessionData.forEach((r) => {
    td += r.durationMin;
    tdist += r.distanceKm;
    tk += r.kcal;
    te += r.elevGainM || 0;
    vtw += r.vo2 * r.durationMin;
    itw += r.inclinePct * r.durationMin;
  });
  if (td === 0) {
    return {
      totalDuration: 0, totalDistance: 0, totalKcal: 0, totalElev: 0,
      meanVo2: 0, meanMets: 0, meanSpeed: 0, meanPaceDecimal: 0, meanIncline: 0,
    };
  }
  const mv = vtw / td;
  const mm = mv / 3.5;
  const th = td / 60;
  const ms = th > 0 ? tdist / th : 0;
  const mp = ms > 0 ? 60 / ms : 0;
  const mi = itw / td;
  return {
    totalDuration: td, totalDistance: tdist, totalKcal: tk, totalElev: te,
    meanVo2: mv, meanMets: mm, meanSpeed: ms, meanPaceDecimal: mp, meanIncline: mi,
  };
}
