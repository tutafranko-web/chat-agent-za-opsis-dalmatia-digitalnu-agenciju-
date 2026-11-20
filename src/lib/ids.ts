import { randomBytes } from "node:crypto";

// Crockford base32: no I, L, O, U — easy to read aloud and type from a printout.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % 32];
  return out;
}

export const newBookingRef = () => `OPS-${randomCode(6)}`;
export const newLandlordId = () => `L-${randomCode(8)}`;
export const newOperatorId = () => `OP-${randomCode(6)}`;
export const newActivityId = () => `A-${randomCode(6)}`;
export const newQuizId = () => `Q-${randomCode(8)}`;
export const newConversationId = () => randomCode(12);
export const newNonce = () => randomCode(16);

export const LANDLORD_ID_RE = /^L-[0-9A-HJKMNP-TV-Z]{8}$/;
export const BOOKING_REF_RE = /^OPS-[0-9A-HJKMNP-TV-Z]{6}$/;
export const ACTIVITY_ID_RE = /^A-[0-9A-HJKMNP-TV-Z]{6}$/;
export const OPERATOR_ID_RE = /^OP-[0-9A-HJKMNP-TV-Z]{6}$/;

/** Generate an id that does not collide with `existing` (checked by the caller's fresh read). */
export function uniqueId(make: () => string, existing: Set<string>): string {
  for (let i = 0; i < 20; i++) {
    const id = make();
    if (!existing.has(id)) return id;
  }
  throw new Error("Could not generate a unique id");
}
