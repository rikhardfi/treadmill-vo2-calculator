/**
 * ACSM-based VO₂ estimation for treadmill running.
 *
 * VO₂ (mL/kg/min) = (3.5 + 0.2 × speed_m_per_min + 0.9 × speed_m_per_min × grade_fraction) × economy_factor
 *
 * All functions are pure — they accept settings as arguments and never read the DOM.
 */

/**
 * Convert km/h to metres per minute.
 */
export function speedToMperMin(speedKmh) {
  return speedKmh * 1000 / 60;
}

/**
 * Convert incline percentage to fraction (e.g. 5 → 0.05).
 */
export function gradeFrac(inclinePct) {
  return (isFinite(inclinePct) ? inclinePct : 0) / 100;
}

/**
 * Compute VO₂ from speed, incline, and economy factor.
 * @param {number} speedKmh   – treadmill speed in km/h
 * @param {number} inclinePct – treadmill incline in %
 * @param {number} economyPct – running economy as percentage (100 = typical)
 * @returns {{ vo2: number, mets: number }}
 */
export function computeVo2(speedKmh, inclinePct, economyPct) {
  const ef = (economyPct || 100) / 100;
  const sm = speedToMperMin(speedKmh);
  const g = gradeFrac(inclinePct);
  const vo2 = 3.5 + (0.2 * sm + 0.9 * sm * g) * ef;
  return { vo2, mets: vo2 / 3.5 };
}

/**
 * Solve for speed (km/h) given a target VO₂, incline, and economy.
 * Returns null if no valid solution exists.
 */
export function solveSpeedForVo2(targetVo2, inclinePct, economyPct) {
  const ef = (economyPct || 100) / 100;
  if (targetVo2 <= 3.5) return null;
  const g = gradeFrac(inclinePct);
  const d = (0.2 + 0.9 * g) * ef;
  if (d <= 0) return null;
  const sm = (targetVo2 - 3.5) / d;
  if (sm <= 0) return null;
  return sm * 60 / 1000;
}

/**
 * Solve for incline (%) given a target VO₂, speed, and economy.
 * Returns null if no valid solution exists.
 */
export function solveInclineForVo2(targetVo2, speedKmh, economyPct) {
  const ef = (economyPct || 100) / 100;
  if (targetVo2 <= 3.5) return null;
  const sm = speedToMperMin(speedKmh);
  const num = (targetVo2 - 3.5) / ef - 0.2 * sm;
  const den = 0.9 * sm;
  if (den <= 0) return null;
  const gp = (num / den) * 100;
  if (!isFinite(gp) || gp < 0) return null;
  return gp;
}

/**
 * Compute energy (kcal) for an interval.
 * Assumes 5 kcal per litre of O₂ consumed.
 */
export function computeKcal(vo2, bodyMassKg, durationMin) {
  return (vo2 * bodyMassKg / 1000) * 5 * durationMin;
}

/**
 * Compute elevation gain (metres) for an interval.
 */
export function computeElevation(distanceKm, inclinePct) {
  return distanceKm * 1000 * (inclinePct / 100);
}

/**
 * Get economy category label key for a given economy percentage.
 */
export function getEconomyCategory(pct) {
  if (pct <= 90) return 'veryEconomical';
  if (pct <= 99) return 'economical';
  if (pct === 100) return 'typical';
  if (pct <= 110) return 'slightlyLess';
  return 'clearlyLess';
}
