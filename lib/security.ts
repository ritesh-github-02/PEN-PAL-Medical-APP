import crypto from 'crypto';

// ── Constants ─────────────────────────────────────────────────────────────

/** Token scheme prefix — not a security boundary, only a visual marker */
export const TOKEN_PREFIX = 'PEN';

// Number of raw random bytes per token BEFORE Base32 encoding.
// 5 bytes = 40 bits  →  8 Base32 chars  →  an alphanumeric payload segment.
const RANDOM_BYTE_LENGTH = 5;

/**
 * Security augment ID.  Bump this value whenever you change the token
 * format, signing algorithm, or secret key.  Old tokens can still be parsed
 * but their HMAC will no longer validate and they will be rejected.
 */
const AUGMENT_ID = 'v2';

// ── Low-level hashing helpers ────────────────────────────────────────────────

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function hmacSha256Hex(secret: string, message: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

// ── URL-safe Base32 codec ─────────────────────────────────────────────────────
// Base32 was chosen because it uses only [A-Z 2-7] — no + / = that break in URLs.
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const _ALPHABET_MAP: Record<string, number> = Object.fromEntries(
  [...BASE32_ALPHABET].map((c, i) => [c, i]),
);

function _bitsFromByte(b: number): string {
  return b.toString(2).padStart(8, '0');
}

function _charFromBits(bits5: string): string {
  return BASE32_ALPHABET[parseInt(bits5, 2)];
}

/**
 * Encode exactly 5 random bytes into 8 URL-safe Base32 characters.
 * @param bytes  Buffer with exactly `RANDOM_BYTE_LENGTH` (5) bytes
 * @returns      8-char Base32 string e.g. "PEN2E7XY"
 */
export function base32Encode(bytes: Buffer): string {
  if (bytes.length < RANDOM_BYTE_LENGTH) {
    throw new Error(`base32Encode needs ${RANDOM_BYTE_LENGTH} bytes, got ${bytes.length}`);
  }
  const bits = Array.from(bytes.slice(0, RANDOM_BYTE_LENGTH))
    .map(_bitsFromByte)
    .join('');
  return _charFromBits(bits.slice(0, 5)) +
         _charFromBits(bits.slice(5, 10)) +
         _charFromBits(bits.slice(10, 15)) +
         _charFromBits(bits.slice(15, 20)) +
         _charFromBits(bits.slice(20, 25)) +
         _charFromBits(bits.slice(25, 30)) +
         _charFromBits(bits.slice(30, 35)) +
         _charFromBits(bits.slice(35, 40));
}

/**
 * Thrown when a token fails structural or HMAC validation.  Catch this at
 * HTTP / API boundaries and respond with a generic "invalid token" message —
 * never expose the reason to end users.
 */
export class TokenTamperingError extends Error {
  constructor(message: string) {
    super(`[SECURITY-TAMPER-DETECTED] ${message}`);
    this.name = 'TokenTamperingError';
  }
}

/** Reconstruct a 5-byte Buffer from 8 Base32 chars produced by `base32Encode`. */
function base32Decode(b32: string): Buffer {
  if (b32.length !== 8) throw new TokenTamperingError(`Base32 segment must be 8 chars, got ${b32.length}`);
  const bits = [...b32.toUpperCase()].map((c) => {
    const v = _ALPHABET_MAP[c];
    if (v === undefined) throw new TokenTamperingError(`Invalid Base32 character: ${c}`);
    return v.toString(2).padStart(5, '0');
  }).join('');
  const out: number[] = [];
  for (let i = 0; i < 40; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}

// ── Helper ─────────────────────────────────────────────────────────────────

/** Message that is signed inside the HMAC: `{augmentId}:{participantId}:{random}` */
function signingMessage(augmentId: string, participantId: string, randomB32: string): string {
  return `${augmentId}:${participantId}:${randomB32}`;
}

/** Derive first 3 octets of an IP for optional client-fingerprint auditing */
export function ipOctetPrefix(ip: string): string {
  return ip.split('.').slice(0, 3).join('.');
}

// ── Token types ─────────────────────────────────────────────────────────────

export interface ParsedToken {
  raw: string;      // exactly as issued: "PEN-{payload}-{hmac}"
  participantId: string; // embedded participant CUID: "cuid-nnnn:PEN2E7XY"
  randomB32: string;  // the 8 Base32 chars
  hmac: string;     // 64-char lowercase hex
}

// ── Parse ─────────────────────────────────────────────────────────────────

/**
 * Parse and structurally validate a raw token string.
 * @throws TokenTamperingError on any structural anomaly.
 *
 * Token format: `PEN-{participantId}:{8Base32}-{64HexHMAC}`
 */
export function parseToken(raw: string): ParsedToken {
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  // Regex: PEN-{anything-not-dash}:{8Base32}-{64hex}
  const match = /^PEN-(\w+[\w\-]*):([A-Z2-7]{8})-([0-9a-f]{64})$/i.exec(trimmed);
  if (!match) {
    throw new TokenTamperingError(
      `Malformed token — expected PEN-{participantId}:{8base32}-{hmac} but received "${trimmed.slice(0, 32)}${trimmed.length > 32 ? '…' : ''}"`,
    );
  }
  const [, participantId, randomB32, hmac] = match;
  return { raw: trimmed, participantId, randomB32: randomB32.toUpperCase(), hmac: hmac.toLowerCase() };
}

// ── Crypto-only verification ─ ─────────────────────────────────────────────────

/**
 * Verify the HMAC of a raw token against `ADMIN_SECRET` without touching DB.
 * Covers `{augmentId}:{participantId}:{randomB32}` — knowing `ADMIN_SECRET`
 * is required to forge or modify any segment.
 *
 * @returns true if the token is structurally valid AND the HMAC matches.
 */
export function verifyTokenCrypto(rawInput: string, secret: string): boolean {
  let parsed: ParsedToken;
  try {
    parsed = parseToken(rawInput);
  } catch {
    return false;
  }
  const expected = hmacSha256Hex(secret, signingMessage(AUGMENT_ID, parsed.participantId, parsed.randomB32));
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.hmac));
}

// ── Token generation ─ ────────────────────────────────────────────────────────

/**
 * Generate a new cryptographically secure access token bound to `participantId`.
 *
 * Wire format: `PEN-{participantId}:{base32(5 random bytes)}-{HMAC_SHA256}`
 *
 * What each piece protects:
 *   ① participantId embedded in payload — token is explicitly tied to one user
 *   ② randomB32  (5 random bytes = 40 bits) — unguessable, unpredictable
 *   ③ hmac       HMAC-SHA-256 over `augmentId:participantId:randomB32` — any
 *                 change to any segment produces a completely different tag;
 *                 forgery requires `ADMIN_SECRET`
 *   ④ sha         SHA-256 of the full raw token — stored as `tokenHash` in the DB;
 *                 the raw token is NEVER persisted in plaintext.
 *
 * @param secret         Server-side secret (ADMIN_SECRET from env)
 * @param participantId  CUID of the participant this token is bound to
 * @param expiresAt      Optional absolute expiry (null = no expiry; set a Date for time-limited tokens)
 */
export function generateSecureToken(
  secret: string,
  participantId: string,
  expiresAt?: Date | null,
): { raw: string; sha: string; payload: string; randomB32: string; hmac: string } {
  const randomB32 = base32Encode(crypto.randomBytes(RANDOM_BYTE_LENGTH));
  const payload = `${participantId}:${randomB32}`;
  const hmac = hmacSha256Hex(secret, signingMessage(AUGMENT_ID, participantId, randomB32));
  const raw = [TOKEN_PREFIX, payload, hmac].join('-');
  const sha = sha256Hex(raw);
  return { raw, sha, payload, randomB32, hmac };
}
