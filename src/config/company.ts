/**
 * Company identity shown in the footer, legal pages and e-mails.
 *
 * PILOT: these are placeholder (fictional) details, as agreed for the trial.
 * Replace every value here before a real commercial launch — nothing else in
 * the code needs to change.
 */
export const COMPANY = {
  brand: "Opsis Dalmatia",
  legalName: "Opsis Dalmatia j.d.o.o. (demo)",
  oib: "00000000000",
  address: "Ulica Primjer 1, 21000 Split, Hrvatska",
  registry: "Trgovački sud u Splitu, MBS 000000000 (demo)",
  email: "opsisdalmatia@gmail.com",
  website: "https://opsisdalmatia.com",
  /** Shown as the data controller contact in the privacy notice. */
  privacyContact: "opsisdalmatia@gmail.com",
  /** True while the details above are placeholders. Drives a small "demo" note. */
  isPlaceholder: true,
} as const;

export const TERMS_VERSION = "2026-11-20";
export const PRIVACY_VERSION = "2026-11-20";
