// Shared UK location matching.
//
// Consolidates the five divergent UK checks that grew up inside
// fetch-external-jobs (The Muse UK_RE, Workday isUkLocation, the inline F1/
// motorsport check, Talent Funnel UK_LOCATION_RE, and UK_LOCATION_RE_INTERNS).
// They disagreed with each other in ways that let bad data through:
//
//   - Workday's isUkLocation() matched bare /\byork\b/, so "New York, NY"
//     was classified as UK. Fixed here with a (?<!New )York lookbehind.
//   - Talent Funnel's UK_LOCATION_RE listed Dublin, which is Ireland.
//     Dropped.
//   - Several callers fall back to `location || "United Kingdom"`, i.e. an
//     unknown location is silently assumed UK. isUkLocation() returns FALSE
//     for empty/unknown so new callers cannot inherit that hole.
//
// This is a safety net, not the primary control. The first line of defence is
// always the source itself (Adzuna's /jobs/gb/ path, Jooble's
// location: "United Kingdom", Careerjet's locale_code=en_GB).

/** Nation-level identifiers. Strongest signal. */
const UK_NATION_RE =
  /\b(united kingdom|great britain|britain|england|scotland|wales|northern ireland|u\.k\.|uk|gb)\b/i;

/**
 * UK towns and cities. Union of all five original lists, minus Dublin.
 *
 * `(?<!New )York` keeps York while rejecting New York.
 *
 * Deliberately EXCLUDED as too generic to match safely on their own:
 *   "Grove" (from the F1 list — Ladbroke Grove, Grove Street, etc.)
 * Genuinely ambiguous with non-UK cities (Birmingham AL, Manchester NH,
 * Boston MA, Perth AU, Richmond VA) are kept, because NON_UK_RE below
 * disambiguates them when an explicit non-UK marker is present.
 */
const UK_CITY_RE = new RegExp(
  "\\b(" +
    [
      // England — majors
      "london", "manchester", "birmingham", "leeds", "liverpool", "bristol",
      "sheffield", "nottingham", "newcastle", "leicester", "coventry",
      "southampton", "portsmouth", "brighton", "reading", "cambridge",
      "oxford", "hull", "derby", "stoke", "plymouth", "exeter", "bath",
      "norwich", "ipswich", "colchester", "chelmsford", "luton",
      "peterborough", "lincoln", "doncaster", "rotherham", "barnsley",
      "blackpool", "blackburn", "burnley", "oldham", "rochdale", "stockport",
      "salford", "chester", "shrewsbury", "telford", "worcester", "hereford",
      "gloucester", "cheltenham", "swindon", "bournemouth", "poole",
      "salisbury", "winchester", "basildon", "southend", "romford",
      "croydon", "preston", "bolton", "wigan", "warrington", "bradford",
      "wakefield", "huddersfield", "sunderland", "middlesbrough",
      // England — commuter belt / tech corridor
      "milton keynes", "watford", "st albans", "guildford", "crawley",
      "woking", "slough", "reigate", "basingstoke", "maidenhead",
      "northampton", "northamptonshire", "wellingborough",
      // Motorsport valley (from the F1 source's inline list)
      "silverstone", "brackley", "enstone", "banbury", "bicester", "towcester",
      // Scotland
      "glasgow", "edinburgh", "aberdeen", "dundee", "inverness", "stirling",
      "paisley",
      // Wales
      "cardiff", "swansea", "newport", "wrexham",
      // Northern Ireland
      "belfast", "lisburn", "londonderry", "derry",
      // Counties / regions
      "yorkshire", "midlands", "merseyside", "tyneside", "home counties",
    ].join("|") +
    "|(?<!New )York" +
    ")\\b",
  "i",
);

/**
 * Explicit non-UK markers. Used to reject multi-location postings that list a
 * UK shell office alongside the real overseas location.
 *
 * `, [A-Z]{2}\b` catches US state suffixes ("Boston, MA"). Note it also
 * matches ", UK" — which is why callers must treat a non-UK signal as
 * disqualifying ONLY when there is no positive UK signal. See isUkLocationList.
 */
const NON_UK_RE =
  /\b(USA|United States|, [A-Z]{2}\b|India|Bangalore|Bengaluru|Mumbai|Delhi|Hyderabad|Pune|Singapore|Sydney|Melbourne|Toronto|Vancouver|Berlin|Munich|Paris|Amsterdam|Rotterdam|Dublin|Cork|Madrid|Barcelona|Lisbon|Tokyo|Hong Kong|Shanghai|Seoul|Mexico|Brazil|Canada|Australia|New Zealand|Germany|France|Spain|Italy|Netherlands|Belgium|Ireland|Japan|China|Philippines|Poland|Romania|Bulgaria|Hungary|Czech|Argentina|Chile|Colombia|South Africa|Dubai|Abu Dhabi|Qatar|San Francisco|New York|Boston|Seattle|Austin|Chicago|Denver|Atlanta|Los Angeles|Miami|Dallas|Houston|Phoenix|Mountain View|Sunnyvale|Cupertino|Palo Alto|Santa Monica|Indianapolis)\b/i;

/** Remote phrasing that should not, on its own, disqualify a posting. */
const REMOTE_RE = /\b(remote|work from home|wfh|hybrid|flexible)\b/i;

/**
 * True if the string carries a positive UK signal.
 *
 * Returns FALSE for empty/null/whitespace — an unknown location is NOT assumed
 * to be UK. This is the main behavioural difference from the ad-hoc checks it
 * replaces.
 */
export function isUkLocation(location: string | null | undefined): boolean {
  if (!location) return false;
  const t = location.trim();
  if (!t) return false;
  return UK_NATION_RE.test(t) || UK_CITY_RE.test(t);
}

/** True if the string carries an explicit non-UK marker. */
export function hasNonUkSignal(location: string | null | undefined): boolean {
  if (!location) return false;
  return NON_UK_RE.test(location);
}

/** True if the string mentions remote/hybrid working. */
export function isRemote(location: string | null | undefined): boolean {
  if (!location) return false;
  return REMOTE_RE.test(location);
}

/**
 * Multi-location verdict, mirroring the strict gate the The Muse adapter uses.
 *
 * A posting is UK if any location is UK. An explicit non-UK marker only
 * disqualifies when no location is UK — otherwise "London, UK" would be
 * rejected by the `, [A-Z]{2}` branch of NON_UK_RE.
 *
 * A lone remote entry with no other location is accepted, since UK-scoped
 * sources use "Remote" to mean UK-remote.
 */
export function isUkLocationList(locations: string[]): boolean {
  const entries = locations.map((l) => (l || "").trim()).filter(Boolean);
  if (entries.length === 0) return false;

  const hasUk = entries.some(isUkLocation);
  if (hasUk) return true;

  const hasNonUk = entries.some(hasNonUkSignal);
  if (hasNonUk) return false;

  return entries.length === 1 && isRemote(entries[0]);
}

/**
 * Tidy a location string for storage: collapse whitespace, strip trailing
 * separators, cap at the 200 chars the callers already truncate to.
 *
 * Does NOT default to "United Kingdom" — callers must decide what an unknown
 * location means, rather than inheriting a silent assumption.
 */
export function normaliseUkLocation(location: string | null | undefined): string {
  if (!location) return "";
  return location
    .replace(/\s+/g, " ")
    .replace(/^[\s,;|-]+|[\s,;|-]+$/g, "")
    .trim()
    .slice(0, 200);
}
