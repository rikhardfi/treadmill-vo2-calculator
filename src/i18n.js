const translations = {
  en: {
    title: 'Treadmill VO₂ & Session Builder',
    subtitle: 'Estimate running VO₂ from treadmill speed and incline',
    languageToggle: 'FI',

    // Section headings
    sectionAthlete: '1. Athlete settings',
    sectionInterval: '2. Interval settings',
    sectionSession: '3. Session overview',

    // Athlete settings
    labelBodyMass: 'Body mass (kg)',
    labelEconomy: 'Running economy vs typical (%)',
    economyHint: '100% ≈ "typical" trained runner. Lower = more economical, higher = less economical.',
    economyScale: '80–90%: very economical · 91–99%: economical · 100%: typical · 101–110%: slightly less · 111–120%: clearly less',

    // Economy categories
    veryEconomical: 'Very economical',
    economical: 'Economical',
    typical: 'Typical',
    slightlyLess: 'Slightly less economical',
    clearlyLess: 'Clearly less economical',

    // Interval settings
    labelSpeed: 'Speed (km/h)',
    labelOrPace: 'Or enter pace:',
    labelPace: 'Pace (min/km, mm:ss)',
    labelIncline: 'Incline (%)',
    labelDuration: 'Duration (min)',
    labelOr: 'or',
    labelDistance: 'Distance (km)',
    labelFillEither: 'Fill either duration or distance.',
    labelVo2: 'VO₂ preview / target (mL/kg/min)',
    vo2Hint: 'Click to estimate VO₂ from inputs, or type your own target.',
    labelSolve: 'Adjust automatically to match VO₂',
    solveHint: 'Example: choose "Calculate speed", set VO₂ = 45 and incline = 7%, then click "Solve".',

    // Solve mode options
    solveOptVo2: 'Calculate VO₂ (keep speed & incline)',
    solveOptSpeed: 'Calculate speed (keep VO₂ & incline)',
    solveOptIncline: 'Calculate incline (keep VO₂ & speed)',

    // Buttons
    btnUseSpeed: 'Use speed & incline',
    btnSolve: 'Solve',
    btnAdd: '+ Add interval to session',
    btnDownloadTxt: 'Download TXT',
    btnCopyTxt: 'Copy TXT',
    btnDownloadXlsx: 'Download XLSX',
    btnDownloadPdf: 'Download PDF',

    // Session table
    labelSessionName: 'Session name',
    sessionNamePlaceholder: 'e.g. VO₂ intervals 4 × 5 min',
    thSpeed: 'Speed<br>(km/h)',
    thPace: 'Pace<br>(min/km)',
    thIncline: 'Incline<br>(%)',
    thDuration: 'Duration<br>(min)',
    thDistance: 'Distance<br>(km)',
    thElevation: 'Elevation<br>(m)',
    thVo2: 'VO₂<br>(mL/kg/min)',
    thMets: 'METs',
    thEnergy: 'Energy<br>(kcal)',
    thTotals: 'Total / mean',

    exportNote: 'Export includes athlete settings, running economy, calculation background and © Rikhard Mäki-Heikkilä – rikhard.fi/calculators –',

    // Alerts
    alertEnterSpeed: 'Enter speed (km/h) or pace (min/km) first.',
    alertEnterSpeedIncline: 'Enter speed and incline first.',
    alertEnterVo2: 'Enter a VO₂ target first.',
    alertVo2TooLow: 'Target VO₂ is too low.',
    alertCannotSolveSpeed: 'Cannot solve speed for this combination.',
    alertSpeedNonPositive: 'Calculated speed would be non-positive.',
    alertCannotSolveIncline: 'Cannot solve incline for this combination.',
    alertNegativeIncline: 'This combination would require a negative incline.',
    alertEnterSpeedOrPace: 'Please enter either a valid speed (km/h) or pace (min/km).',
    alertEnterDuration: 'Please enter either duration (min) or distance (km).',
    alertAddInterval: 'Add at least one interval before exporting.',
    alertCopied: 'Session text copied to clipboard.',
    alertCopyFailed: 'Could not copy to clipboard.',
    alertXlsxUnavailable: 'Excel export is not available.',
    alertPdfUnavailable: 'PDF export is not available.',

    // Help / instructions
    helpTitle: 'How to use',
    helpSteps: [
      'Set <strong>body mass</strong> and choose your <strong>running economy</strong> on the slider.',
      'For each interval, enter <strong>speed</strong> (or pace in mm:ss) and <strong>incline</strong>.',
      'Use the VO₂ box to preview VO₂ from speed & incline or set a <strong>target VO₂</strong> and solve for speed or incline.',
      'Enter either <strong>duration (min)</strong> or <strong>distance (km)</strong>.',
      'Click <em>"Add interval to session"</em>. The row appears in the table below.',
      'Edit any interval directly in the table – values will update automatically.',
      'Drag and drop rows to reorder, or delete rows with the × button.',
      'When ready, give the session a name and export as plain text, Excel or PDF.',
    ],
    helpBackgroundTitle: 'Background & assumptions',
    helpBackground: [
      'VO₂ is estimated from treadmill running speed and incline and then scaled using the running economy slider. The slider represents individual variation in oxygen cost: values < 100% represent better-than-typical running economy (lower VO₂ at a given speed), and values > 100% represent less economical running.',
      'Calories are estimated from VO₂ assuming that each litre of oxygen consumed corresponds to approximately 5 kcal of energy expenditure. This is a standard practical approximation in exercise physiology.',
      'The calculation is most appropriate for steady-state treadmill running at moderate-to-high speeds and inclines. It does not account for sprinting mechanics, handrail use, or large fluctuations in speed.',
    ],
    helpFinnishTitle: 'Käyttö lyhyesti (suomeksi)',
    helpFinnishSteps: [
      'Syötä <strong>kehon paino</strong> ja säädä <strong>juoksun taloudellisuus</strong> -liukusäädintä.',
      'Anna kullekin vedolle vauhti (km/h <em>tai</em> min/km, muodossa mm:ss) ja kaltevuus (%).',
      'Esikatsele tai aseta <strong>VO₂</strong> VO₂-kentässä ja käytä "Solve"-painiketta, jos haluat muuttaa vauhtia tai kaltevuutta.',
      'Syötä joko <strong>kesto (min)</strong> tai <strong>matka (km)</strong>.',
      'Paina "Lisää veto" lisätäksesi vedon taulukkoon.',
      'Voit muokata vetojen arvoja suoraan taulukossa, poistaa rivejä tai vaihtaa niiden järjestystä raahaamalla.',
      'Nimeä harjoitus ja vie se tekstitiedostona, Excel-muodossa tai PDF:nä jatkokäyttöä varten.',
    ],
  },

  fi: {
    title: 'Juoksumaton VO₂-laskuri ja harjoitussuunnittelija',
    subtitle: 'Arvioi juoksun VO₂ juoksumaton nopeuden ja kaltevuuden perusteella',
    languageToggle: 'EN',

    sectionAthlete: '1. Urheilijan asetukset',
    sectionInterval: '2. Vedon asetukset',
    sectionSession: '3. Harjoituksen yhteenveto',

    labelBodyMass: 'Kehon paino (kg)',
    labelEconomy: 'Juoksun taloudellisuus vs. tyypillinen (%)',
    economyHint: '100% ≈ "tyypillinen" harjoiteltu juoksija. Pienempi = taloudellisempi, suurempi = vähemmän taloudellinen.',
    economyScale: '80–90%: erittäin taloudellinen · 91–99%: taloudellinen · 100%: tyypillinen · 101–110%: hieman vähemmän · 111–120%: selvästi vähemmän',

    veryEconomical: 'Erittäin taloudellinen',
    economical: 'Taloudellinen',
    typical: 'Tyypillinen',
    slightlyLess: 'Hieman vähemmän taloudellinen',
    clearlyLess: 'Selvästi vähemmän taloudellinen',

    labelSpeed: 'Nopeus (km/h)',
    labelOrPace: 'Tai syötä vauhti:',
    labelPace: 'Vauhti (min/km, mm:ss)',
    labelIncline: 'Kaltevuus (%)',
    labelDuration: 'Kesto (min)',
    labelOr: 'tai',
    labelDistance: 'Matka (km)',
    labelFillEither: 'Syötä joko kesto tai matka.',
    labelVo2: 'VO₂ esikatselu / tavoite (mL/kg/min)',
    vo2Hint: 'Klikkaa arvioidaksesi VO₂ syötetyistä arvoista tai kirjoita oma tavoite.',
    labelSolve: 'Säädä automaattisesti VO₂:n mukaan',
    solveHint: 'Esimerkki: valitse "Laske nopeus", aseta VO₂ = 45 ja kaltevuus = 7%, paina "Ratkaise".',

    solveOptVo2: 'Laske VO₂ (säilytä nopeus ja kaltevuus)',
    solveOptSpeed: 'Laske nopeus (säilytä VO₂ ja kaltevuus)',
    solveOptIncline: 'Laske kaltevuus (säilytä VO₂ ja nopeus)',

    btnUseSpeed: 'Käytä nopeutta ja kaltevuutta',
    btnSolve: 'Ratkaise',
    btnAdd: '+ Lisää veto harjoitukseen',
    btnDownloadTxt: 'Lataa TXT',
    btnCopyTxt: 'Kopioi TXT',
    btnDownloadXlsx: 'Lataa XLSX',
    btnDownloadPdf: 'Lataa PDF',

    labelSessionName: 'Harjoituksen nimi',
    sessionNamePlaceholder: 'esim. VO₂-vedot 4 × 5 min',
    thSpeed: 'Nopeus<br>(km/h)',
    thPace: 'Vauhti<br>(min/km)',
    thIncline: 'Kaltevuus<br>(%)',
    thDuration: 'Kesto<br>(min)',
    thDistance: 'Matka<br>(km)',
    thElevation: 'Nousu<br>(m)',
    thVo2: 'VO₂<br>(mL/kg/min)',
    thMets: 'MET',
    thEnergy: 'Energia<br>(kcal)',
    thTotals: 'Yhteensä / keskim.',

    exportNote: 'Vienti sisältää urheilijan asetukset, juoksun taloudellisuuden, laskentaperusteen ja © Rikhard Mäki-Heikkilä – rikhard.fi/calculators –',

    alertEnterSpeed: 'Syötä nopeus (km/h) tai vauhti (min/km) ensin.',
    alertEnterSpeedIncline: 'Syötä nopeus ja kaltevuus ensin.',
    alertEnterVo2: 'Syötä VO₂-tavoite ensin.',
    alertVo2TooLow: 'VO₂-tavoite on liian matala.',
    alertCannotSolveSpeed: 'Nopeutta ei voi ratkaista tälle yhdistelmälle.',
    alertSpeedNonPositive: 'Laskettu nopeus olisi ei-positiivinen.',
    alertCannotSolveIncline: 'Kaltevuutta ei voi ratkaista tälle yhdistelmälle.',
    alertNegativeIncline: 'Tämä yhdistelmä vaatisi negatiivisen kaltevuuden.',
    alertEnterSpeedOrPace: 'Syötä joko nopeus (km/h) tai vauhti (min/km).',
    alertEnterDuration: 'Syötä joko kesto (min) tai matka (km).',
    alertAddInterval: 'Lisää vähintään yksi veto ennen vientiä.',
    alertCopied: 'Harjoituksen teksti kopioitu leikepöydälle.',
    alertCopyFailed: 'Leikepöydälle kopioiminen epäonnistui.',
    alertXlsxUnavailable: 'Excel-vienti ei ole käytettävissä.',
    alertPdfUnavailable: 'PDF-vienti ei ole käytettävissä.',

    helpTitle: 'Käyttöohje',
    helpSteps: [
      'Aseta <strong>kehon paino</strong> ja valitse <strong>juoksun taloudellisuus</strong> liukusäätimellä.',
      'Syötä kullekin vedolle <strong>nopeus</strong> (tai vauhti muodossa mm:ss) ja <strong>kaltevuus</strong>.',
      'Käytä VO₂-kenttää arvioidaksesi VO₂ nopeudesta ja kaltevuudesta tai aseta <strong>VO₂-tavoite</strong> ja ratkaise nopeus tai kaltevuus.',
      'Syötä joko <strong>kesto (min)</strong> tai <strong>matka (km)</strong>.',
      'Klikkaa <em>"Lisää veto harjoitukseen"</em>. Rivi ilmestyy alla olevaan taulukkoon.',
      'Muokkaa vetojen arvoja suoraan taulukossa – arvot päivittyvät automaattisesti.',
      'Järjestä rivejä raahaamalla tai poista × -painikkeella.',
      'Kun valmis, nimeä harjoitus ja vie se teksti-, Excel- tai PDF-muodossa.',
    ],
    helpBackgroundTitle: 'Taustaa ja oletukset',
    helpBackground: [
      'VO₂ arvioidaan juoksumaton nopeuden ja kaltevuuden perusteella ja skaalataan juoksun taloudellisuus -liukusäätimellä. Liukusäädin kuvaa yksilöllistä vaihtelua hapenkulutuksessa: arvot < 100 % tarkoittavat tyypillistä parempaa juoksun taloudellisuutta (pienempi VO₂ samalla nopeudella), ja arvot > 100 % vähemmän taloudellista juoksua.',
      'Kalorit arvioidaan VO₂:sta olettaen, että yksi litra happea vastaa noin 5 kcal energiankulutusta. Tämä on yleinen käytännön likiarvo liikuntafysiologiassa.',
      'Laskenta soveltuu parhaiten tasaisen vauhdin juoksumattojuoksuun kohtalaisilla tai korkeilla nopeuksilla ja kaltevuuksilla. Se ei huomioi pikajuoksun mekaniikkaa, käsijohteisiin tukeutumista tai suuria nopeudenvaihteluita.',
    ],
    helpFinnishTitle: '',
    helpFinnishSteps: [],
  },
};

let currentLang = 'en';

/**
 * Get a translation by key.
 */
export function t(key) {
  const val = translations[currentLang]?.[key];
  return val !== undefined ? val : translations.en[key] ?? key;
}

/**
 * Get the current language code.
 */
export function getLanguage() {
  return currentLang;
}

/**
 * Toggle between EN and FI.
 */
export function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fi' : 'en';
  return currentLang;
}
