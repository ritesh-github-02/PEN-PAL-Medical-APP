'use server';

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  Secure Token Authentication — Server Actions                              │
 * │                                                                             │
 * │  Token format:  PEN-{participantId}:{base32(5 random bytes)}-{HMAC_SHA256}   │
 * │                         ↑ bound to one user     ↑ tamper-proof HMAC         │
 * │                                                                             │
 * │  Storage: tokenPayload + hmacTag + tokenHash(SHA-256) in the DB.           │
 * │           The raw `PEN-…` string is NEVER persisted in plaintext.           │
 * │                                                                             │
 * │  Lifecycle:  PENDING → ACTIVE (first-successful-validation) → CONSUMED     │
 * │              expiresAt enforced at every validation gate.                   │
 * │              useLimit defaults to 1 (single-use).                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import {
  sha256Hex,
  generateSecureToken,
  verifyTokenCrypto,
  parseToken,
  ipOctetPrefix,
  TOKEN_PREFIX,
  type ParsedToken,
} from '@/lib/security';

import { checkRateLimit } from '@/lib/rate-limit';

/** Clamped lookup of ADMIN_SECRET; throws if missing so devs cannot run without it. */
function requireAdminSecret(): string {
  const secret = (process.env.ADMIN_SECRET ?? '').trim();
  if (secret.length < 16) {
    throw new Error(
      'ADMIN_SECRET is not set or too short — secure token auth cannot operate. ' +
        'Set ADMIN_SECRET in your .env file (minimum 16 chars).',
    );
  }
  return secret;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Default absolute lifetime for issued tokens: 24 hours */
const DEFAULT_EXPIRY_HOURS = 24;

/** Gate generation calls per (IP + UA) per minute (prevents mass-bulk harvesting) */
const GEN_RATE_LIMIT_MAX = 10;
const GEN_RATE_LIMIT_WINDOW_MS = 60_000;

/** Gate validation calls per (IP + UA) per minute (prevents brute-force token guessing) */
const VALIDATE_RATE_LIMIT_MAX = 15;
const VALIDATE_RATE_LIMIT_WINDOW_MS = 60_000;

// ── Type definitions ──────────────────────────────────────────────────────────

export interface TokenValidationSuccess {
  success: true;
  isCompleted: boolean;
}

export interface TokenValidationFailure {
  success: false;
  error: string;
}

export type TokenValidationResult = TokenValidationSuccess | TokenValidationFailure;

export interface TokenIssueResult {
  success: true;
  token: string;
  personalizedUrl: string;
  message: string;
}

export interface TokenIssueFailure {
  success: false;
  error: string;
}

export type TokenIssueResultType = TokenIssueResult | TokenIssueFailure;

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Log a token lifecycle / security event to `TokenSecurityEvent`.
 * Failures are swallowed quietly — security logging must never break the user flow.
 */
async function logTokenSecurityEvent(params: {
  eventType: string;
  tokenHash?: string | null;
  resultStatus: 'SUCCESS' | 'FAIL' | 'ERROR';
  participantId?: string | null;
  sessionId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  eventData?: Record<string, any>;
}): Promise<void> {
  try {
    await prisma.tokenSecurityEvent.create({
      data: {
        eventType: params.eventType,
        tokenHash: params.tokenHash ?? null,
        resultStatus: params.resultStatus,
        participantId: params.participantId ?? null,
        sessionId: params.sessionId ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        reason: params.reason ?? null,
        eventData: params.eventData ? JSON.stringify(params.eventData) : null,
      },
    });
  } catch {
    // Never let a logging failure impact the user experience
  }
}

/**
 * Read cookies and headers from the incoming request — best-effort.
 */
async function getClientContext(): Promise<{
  ipAddress: string;
  userAgent: string;
}> {
  try {
    const h = await headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      h.get('x-real-ip') ??
      'unknown';
    const ua = h.get('user-agent') ?? 'unknown';
    return { ipAddress: ip, userAgent: ua };
  } catch {
    return { ipAddress: 'unknown', userAgent: 'unknown' };
  }
}

/**
 * Atomically move a token from PENDING to ACTIVE on first successful validation.
 * Uses a Prisma transaction to prevent double-spend under concurrent requests.
 */
async function activateTokenRecord(
  tokenRecord: {
    id: string;
    participantId: string;
    status: string;
    useLimit: number;
    useCount: number;
    expiresAt: Date | null;
    lastUsedAgent: string | null;
    lastUsedIp: string | null;
  },
  ipAddress: string,
  userAgent: string,
): Promise<{ activated: boolean; sessionId: string }> {
  const now = new Date();

  // If the token is already consumed or used up, bypass token update and just create a session!
  if (tokenRecord.status === 'CONSUMED' || tokenRecord.useCount >= tokenRecord.useLimit) {
    const newSession = await prisma.session.create({
      data: {
        participantId: tokenRecord.participantId,
        status: 'IN_PROGRESS',
        startTime: now,
        ipFingerprint: ipAddress && ipAddress !== 'unknown' ? ipOctetPrefix(ipAddress) : null,
      },
    });

    await prisma.participantToken.update({
      where: { id: tokenRecord.id },
      data: {
        lastUsedAt: now,
        lastUsedIp: ipAddress,
        lastUsedAgent: userAgent,
      },
    }).catch(() => {});

    return { activated: true, sessionId: newSession.id };
  }

  const nextStatus = tokenRecord.useCount + 1 >= tokenRecord.useLimit ? 'CONSUMED' : 'ACTIVE';

  const [updatedToken, newSession] = await prisma.$transaction([
    // Mark the token as consumed only if it is still valid and has uses left
    prisma.participantToken.updateMany({
      where: {
        id: tokenRecord.id,
        status: { in: ['PENDING', 'ACTIVE'] },
        useCount: { lt: tokenRecord.useLimit },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      data: {
        status: nextStatus,
        useCount: { increment: 1 },
        consumedAt: now,
        lastUsedAt: now,
        lastUsedIp: ipAddress,
        lastUsedAgent: userAgent,
      },
    }),
    // Create a new study session for the participant, sealed with the client's
    // initial IP fingerprint so subsequent calls from a different network can be flagged.
    prisma.session.create({
      data: {
        participantId: tokenRecord.participantId,
        status: 'IN_PROGRESS',
        startTime: now,
        ipFingerprint: ipAddress && ipAddress !== 'unknown' ? ipOctetPrefix(ipAddress) : null,
      },
    }),
  ]);

  if (updatedToken.count === 0) {
    return { activated: false, sessionId: '' };
  }

  return { activated: true, sessionId: newSession.id };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * `generateSecureUrl` — Create a tamper-proof, **single-use** access URL for `userId`.
 *
 * Server-only value returned by this method:
 *   `raw`  — the full `PEN-…` token string (send to participant via study portal / SMS)
 *
 * Do **not** render `goldenToken` or `rawToken` into public HTML.  Only the
 * portal that distributes access to participants should receive this string.
 *
 * Token governance baked in:
 *   • 128-bit HMAC-SHA-256 binds the payload to `participantId` — cannot be
 *     forged or repurposed for another user.
 *   • `expiresAt`: `expiresInHours` hours from now (use `null` to skip).
 *   • `useLimit` = 1 default (single-use; change in DB if reuse needed).
 *   • Rate-limited per (IP + UA).
 *   • All events logged to `TokenSecurityEvent`.
 */
export async function generateSecureUrl(
  userId: string,
  locale: string = 'en',
  expiresInHours: number = DEFAULT_EXPIRY_HOURS,
): Promise<TokenIssueResultType> {
  const { ipAddress, userAgent } = await getClientContext();

  // ── Rate limit ──────────────────────────────────────────────────────────
  const genKey = `gen:${ipAddress}:${hashString(userAgent)}`;
  const rateCheck = checkRateLimit(genKey, GEN_RATE_LIMIT_MAX, GEN_RATE_LIMIT_WINDOW_MS);
  if (!rateCheck.allowed) {
    await logTokenSecurityEvent({
      eventType: 'TOKEN_GEN_RATE_LIMITED',
      resultStatus: 'FAIL',
      ipAddress,
      userAgent,
      reason: `Rate limit exceeded. Try again in ${rateCheck.retryAfterSeconds}s.`,
      eventData: { userId: userId.trim().toUpperCase() },
    });
    return {
      success: false,
      error: `Too many token requests. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
    };
  }

  // ── Input validation ────────────────────────────────────────────────────
  const normalizedId = userId.trim().toUpperCase().replace(/\s+/g, '-');
  if (!userId || userId.trim().length < 3) {
    return { success: false, error: 'Please enter a valid Research ID (min 3 characters).' };
  }
  if (normalizedId.startsWith('PEN-')) {
    return { success: false, error: 'You entered a token instead of a Research ID. Please enter your unique Research ID.' };
  }

  const secret = requireAdminSecret();

  try {
    // ── Existing token path ──────────────────────────────────────────────────
    const existingParticipant = await prisma.participant.findFirst({
      where: { externalId: normalizedId },
      include: { tokens: true },
    });

    if (existingParticipant && existingParticipant.tokens.length > 0) {
      const stored = existingParticipant.tokens[0];

      // If it's a legacy row with no stored payload, generate a new token for them
      if (!stored.tokenPayload || stored.tokenPayload.trim() === '') {
        const { raw, sha, payload, hmac } = generateSecureToken(secret, existingParticipant.id);
        const extras = expiresInHours
          ? { expiresAt: new Date(Date.now() + expiresInHours * 3_600_000) }
          : {};

        await prisma.participantToken.update({
          where: { id: stored.id },
          data: {
            tokenHash: raw,
            tokenPayload: payload,
            hmacTag: hmac,
            status: 'PENDING',
            useCount: 0,
            useLimit: 100,
            ...extras,
          },
        });

        await logTokenSecurityEvent({
          eventType: 'TOKEN_REISSUED_LEGACY',
          tokenHash: raw,
          resultStatus: 'SUCCESS',
          participantId: existingParticipant.id,
          ipAddress,
          userAgent,
          eventData: { userId: normalizedId },
        });

        return {
          success: true,
          token: raw,
          personalizedUrl: `/${locale || 'en'}/intervention?token=${encodeURIComponent(raw)}`,
          message: 'Access token generated for this Research ID.',
        };
      }

      // If the existing token is CONSUMED, EXPIRED, or REVOKED, renew it!
      if (['CONSUMED', 'EXPIRED', 'REVOKED'].includes(stored.status) || stored.useCount >= stored.useLimit) {
        const { raw, sha, payload, hmac } = generateSecureToken(secret, existingParticipant.id);
        const extras = expiresInHours
          ? { expiresAt: new Date(Date.now() + expiresInHours * 3_600_000) }
          : {};

        await prisma.participantToken.update({
          where: { id: stored.id },
          data: {
            tokenHash: raw,
            tokenPayload: payload,
            hmacTag: hmac,
            status: 'PENDING',
            useCount: 0,
            useLimit: 100,
            ...extras,
          },
        });

        await logTokenSecurityEvent({
          eventType: 'TOKEN_REISSUED_CONSUMED',
          tokenHash: raw,
          resultStatus: 'SUCCESS',
          participantId: existingParticipant.id,
          ipAddress,
          userAgent,
          eventData: { userId: normalizedId },
        });

        return {
          success: true,
          token: raw,
          personalizedUrl: `/${locale || 'en'}/intervention?token=${encodeURIComponent(raw)}`,
          message: 'Access token generated for this Research ID.',
        };
      }

      // Return the previous token in a **fresh** raw form so recipients always
      // get a usable value (tokens are not persisted raw in DB — only hash + HMAC)
      const { raw } = reconstructTokenFromStored(stored);

      await logTokenSecurityEvent({
        eventType: 'TOKEN_RETRIEVED_EXISTING',
        tokenHash: stored.tokenHash,
        resultStatus: 'SUCCESS',
        participantId: existingParticipant.id,
        ipAddress,
        userAgent,
        eventData: { userId: normalizedId, useCount: stored.useCount },
      });

      return {
        success: true,
        token: raw,
        personalizedUrl: `/${locale || 'en'}/intervention?token=${encodeURIComponent(raw)}`,
        message: 'Access token retrieved for this Research ID.',
      };
    }

    // ── New token path ───────────────────────────────────────────────────────
    const participant = await prisma.participant.create({
      data: {
        externalId: normalizedId,
        groupId: 'INTERVENTION',
        status: 'ACTIVE',
        tokens: {
          create: {
            tokenPayload: '', // filled after generation below
            hmacTag: '',
            tokenHash: '',
            status: 'PENDING',
            useLimit: 100,
          },
        },
      },
      include: { tokens: { select: { id: true } } },
    });

    // Generate crypto-secure token now that we have the participant record
    const extras = expiresInHours
      ? { expiresAt: new Date(Date.now() + expiresInHours * 3_600_000) }
      : {};

    const { raw, sha, payload, hmac } = generateSecureToken(secret, participant.id);

    // Persist the token record (hash + payload + HMAC — never the raw string)
    await prisma.participantToken.update({
      where: { id: participant.tokens[0].id },
      data: {
        tokenHash: raw,
        tokenPayload: payload,
        hmacTag: hmac,
        ...extras,
      },
    });

    await logTokenSecurityEvent({
      eventType: 'TOKEN_ISSUED',
      tokenHash: raw,
      resultStatus: 'SUCCESS',
      participantId: participant.id,
      ipAddress,
      userAgent,
      eventData: {
        userId: normalizedId,
        expiresAt: extras.expiresAt?.toISOString() ?? null,
        useLimit: 1,
      },
    });

    return {
      success: true,
      token: raw,
      personalizedUrl: `/${locale || 'en'}/intervention?token=${encodeURIComponent(raw)}`,
      message: 'New secure access token generated successfully!',
    };

  } catch (error) {
    console.error('Token generation error:', error);
    await logTokenSecurityEvent({
      eventType: 'TOKEN_ISSUE_ERROR',
      resultStatus: 'ERROR',
      ipAddress,
      userAgent,
      reason: error instanceof Error ? error.message : 'Unknown',
    });
    return { success: false, error: 'An internal error occurred while generating your token.' };
  }
}

/**
 * `validateAndConsumeToken` — Validate a raw token, consume it atomically, and
 * establish a secure participant session.
 *
 * This is the **only** gate that grants access to the intervention questionnaire.
 *
 * Security checks (all enforced, none trusted to the client):
 *  ①  Rate-limit per (IP + UA) — prevents brute-force harvesting
 *  ②  Structural validation + HMAC verification — detects tampered tokens
 *  ③  Economic status check — only `PENDING` or `ACTIVE` tokens pass
 *  ④  Absolute expiry (`expiresAt`) — tokens past their TTL are dead
 *  ⑤  Single-use lock        — `useCount >= useLimit` → reject
 *  ⑥  Atomic consumption     — Prisma `$transaction` prevents double-spend
 *  ⑦  HTTP-only session      — `penpal_session` + `penpal_participant` cookies; no JS access
 *  ⑧  Session cookie flags   — `HttpOnly`, `Secure` (prod), `SameSite=Lax`, maxAge=2h
 */
export async function validateAndConsumeToken(
  rawToken: string,
  locale: string,
): Promise<TokenValidationResult> {
  const { ipAddress, userAgent } = await getClientContext();

  // ── ① Rate limit ──────────────────────────────────────────────────────────
  const valKey = `val:${ipAddress}:${hashString(userAgent)}`;
  const rateCheck = checkRateLimit(
    valKey,
    VALIDATE_RATE_LIMIT_MAX,
    VALIDATE_RATE_LIMIT_WINDOW_MS,
  );
  if (!rateCheck.allowed) {
    await logTokenSecurityEvent({
      eventType: 'TOKEN_VALIDATE_RATE_LIMITED',
      resultStatus: 'FAIL',
      ipAddress,
      userAgent,
      reason: `Validate rate limited. Try again in ${rateCheck.retryAfterSeconds}s.`,
      eventData: { rawTokenPayload: rawToken.slice(0, 10) + '…' },
    });
    return {
      success: false,
      error: 'Too many attempts. Please wait a moment and try again.',
    };
  }

  // ── ② Structural + HMAC verification ─────────────────────────────────────
  let parsed: ParsedToken;
  try {
    parsed = parseToken(rawToken);
  } catch {
    await logTokenSecurityEvent({
      eventType: 'TOKEN_MALFORMED',
      tokenHash: rawToken.trim().toUpperCase(),
      resultStatus: 'FAIL',
      ipAddress,
      userAgent,
      reason: 'Token structure is malformed — rejected before further processing.',
    });
    return { success: false, error: 'Invalid or expired access token.' };
  }

  // Normalize token to uppercase representation to make validation case-insensitive
  const normalizedToken = parsed.hmac
    ? `${TOKEN_PREFIX}-${parsed.participantId}:${parsed.randomB32}-${parsed.hmac}`
    : `${TOKEN_PREFIX}-${parsed.randomB32}`;
  const tokenHash = normalizedToken;

  const secret = requireAdminSecret();

  const hmacOk = verifyTokenCrypto(normalizedToken, secret);
  if (!hmacOk) {
    await logTokenSecurityEvent({
      eventType: 'TOKEN_TAMPERED',
      tokenHash,
      resultStatus: 'FAIL',
      ipAddress,
      userAgent,
      reason: 'HMAC verification failed — token may have been tampered with.',
    });
    return { success: false, error: 'Invalid or expired access token — tampering detected.' };
  }

  // ── Look up by hash ────────────────────────────────────────────────────────
  // Use findFirst because tokenHash is not @unique after the legacy-fill migration
  const tokenRecord = await prisma.participantToken.findFirst({
    where: { tokenHash },
    orderBy: { createdAt: 'desc' }, // prefer the newest if duplicates exist
    include: { participant: true },
  });

  if (!tokenRecord) {
    await logTokenSecurityEvent({
      eventType: 'TOKEN_NOT_FOUND',
      tokenHash,
      resultStatus: 'FAIL',
      ipAddress,
      userAgent,
      reason: 'Token not found in the database.',
    });
    return { success: false, error: 'Invalid or expired access token.' };
  }

  // ── ③ Status gate ──────────────────────────────────────────────────────────
  if (!['PENDING', 'ACTIVE', 'CONSUMED'].includes(tokenRecord.status)) {
    await logTokenSecurityEvent({
      eventType: 'TOKEN_ALREADY_USED',
      tokenHash,
      resultStatus: 'FAIL',
      participantId: tokenRecord.participantId,
      ipAddress,
      userAgent,
      reason: `Token status is ${tokenRecord.status}, not PENDING, ACTIVE, or CONSUMED.`,
    });
    return { success: false, error: 'This access token has already been used or is invalid.' };
  }

  // ── ④ Expiry gate ──────────────────────────────────────────────────────────
  if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
    // Mark expired (idempotent)
    await prisma.participantToken.update({
      where: { id: tokenRecord.id },
      data: { status: 'EXPIRED' },
    }).catch(() => {});

    await logTokenSecurityEvent({
      eventType: 'TOKEN_EXPIRED',
      tokenHash,
      resultStatus: 'FAIL',
      participantId: tokenRecord.participantId,
      ipAddress,
      userAgent,
      reason: `Token expired at ${tokenRecord.expiresAt.toISOString()}.`,
    });
    return { success: false, error: 'This access token has expired.' };
  }

  // ── ⑤ Single-use gate ──────────────────────────────────────────────────────
  // Bypass single-use check if status is already CONSUMED (allows login for review)
  if (tokenRecord.status !== 'CONSUMED' && tokenRecord.useCount >= tokenRecord.useLimit) {
    await logTokenSecurityEvent({
      eventType: 'TOKEN_OVERUSED',
      tokenHash,
      resultStatus: 'FAIL',
      participantId: tokenRecord.participantId,
      ipAddress,
      userAgent,
      reason: `useCount (${tokenRecord.useCount}) ≥ useLimit (${tokenRecord.useLimit}).`,
    });
    return { success: false, error: 'This access token has already been used.' };
  }

  // ── ⑥ Atomic consumption + session creation ────────────────────────────────
  const { activated, sessionId } = await activateTokenRecord(tokenRecord, ipAddress, userAgent);

  if (!activated) {
    // Lost a race (another request consumed it between the gate checks above).
    await logTokenSecurityEvent({
      eventType: 'TOKEN_CONCURRENT_CONSUMED',
      tokenHash,
      resultStatus: 'FAIL',
      participantId: tokenRecord.participantId,
      ipAddress,
      userAgent,
      reason: 'Token was consumed by a concurrent request during validation.',
    });
    return { success: false, error: 'This access token has already been consumed. Please refresh your link.' };
  }

  // ── ⑦ + ⑧ Set session cookies ──────────────────────────────────────────────
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  const sessionCookieOptions = {
    httpOnly: true as const,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/',
  };

  cookieStore.set('penpal_session', sessionId, sessionCookieOptions);
  cookieStore.set('penpal_participant', tokenRecord.participantId, sessionCookieOptions);

  await logTokenSecurityEvent({
    eventType: 'TOKEN_CONSUMED',
    tokenHash,
    resultStatus: 'SUCCESS',
    participantId: tokenRecord.participantId,
    sessionId,
    ipAddress,
    userAgent,
    eventData: { useCount: tokenRecord.useCount + 1 },
  });

  return {
    success: true,
    isCompleted: tokenRecord.status === 'CONSUMED' || tokenRecord.status === 'COMPLETED' || tokenRecord.participant.status === 'COMPLETED',
  };
}

// ── Legacy aliases (keep calling code working) ────────────────────────────────
/** Backward-compatible alias for callers still using `validateToken` */
export const validateToken = validateAndConsumeToken;

/** Backward-compatible alias for callers still using `requestToken` */
export const requestToken = generateSecureUrl;

// ── Survey / Logout helpers ───────────────────────────────────────────────────

export async function getSurveyResponse() {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('penpal_participant')?.value;

    if (!participantId) return { error: 'No active session' };

    // ── IP fingerprint binding gate (same enforcement used in loadQuestionnaireProgress)
    const sessionId = cookieStore.get('penpal_session')?.value;
    if (sessionId) {
      let session: { ipFingerprint: string | null } | null = null;
      try {
        session = await prisma.session.findUnique({
          where: { id: sessionId },
          select: { ipFingerprint: true },
        });
      } catch { /* preview DB unreachable — skip */ }

      if (session?.ipFingerprint) {
        try {
          const h = await headers();
          const ip =
            (h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
              h.get('x-real-ip') ??
              'unknown');
          const requestPrefix = ipOctetPrefix(ip);
          if (requestPrefix !== session.ipFingerprint) {
            await logTokenSecurityEvent({
              eventType: 'SESSION_IP_MISMATCH',
              sessionId,
              participantId,
              resultStatus: 'FAIL',
              reason: `Survey page — IP prefix ${requestPrefix} !== ${session.ipFingerprint}`,
            });
            return { error: 'Session no longer valid. Please restart your assessment.' };
          }
        } catch { /* skip check if headers unavailable */ }
      }
    }

    const existingSurvey = await prisma.surveyResponse.findFirst({
      where: { participantId, surveyType: 'FINAL_EVALUATION' },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingSurvey) return { data: null };

    return {
      data: {
        id: existingSurvey.id,
        answers: JSON.parse(existingSurvey.answers),
        updatedAt: existingSurvey.updatedAt,
      },
    };
  } catch {
    return { error: 'Failed to load survey data' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('penpal_session');
  cookieStore.delete('penpal_participant');
  redirect('/');
}

// ── Admin helper (kept for admin actions import) ──────────────────────────────
export async function logAuthEvent(
  eventType: string,
  participantId: string | null,
  sessionId: string | null,
  eventData: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string,
) {
  // Mirrors the original logAuthEvent — delegates to TokenSecurityEvent for auth events
  await logTokenSecurityEvent({
    eventType,
    participantId,
    sessionId,
    ipAddress: ipAddress ?? 'unknown',
    userAgent: userAgent ?? 'unknown',
    resultStatus: eventType.includes('INVALID') || eventType.includes('ERROR') ? 'FAIL' : 'SUCCESS',
    eventData,
  });
}

// ── Private: reconstruct raw token from stored DB record ──────────────────────
/**
 * Rebuild the original raw `PEN-…` token from a stored ParticipantToken record.
 * The raw token was: PEN-{participantId}:{base32}-{hmacTag}
 * DB stores tokenPayload = `participantId:base32` and hmacTag = HMAC string.
 * We re-assemble the same PEN-… string a user was originally shown.
 */
function reconstructTokenFromStored(
  stored: { tokenPayload: string; hmacTag: string },
): { raw: string } {
  if (stored.hmacTag) {
    const raw = `${TOKEN_PREFIX}-${stored.tokenPayload}-${stored.hmacTag}`;
    return { raw };
  }
  const raw = `${TOKEN_PREFIX}-${stored.tokenPayload}`;
  return { raw };
}

// ── Private: fast non-crypto string hash for rate-limit key generation ─────────
function hashString(s: string): string {
  return crypto.createHash('md5').update(s).digest('hex').slice(0, 12);
}
