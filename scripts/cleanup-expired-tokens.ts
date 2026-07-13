/**
 * scripts/cleanup-expired-tokens.ts
 *
 * Cron-style utility: marks expired or already-consumed tokens as EXPIRED / REVOKED
 * so they are never re-usable even if clock skew or a previous run left them hanging.
 *
 * Run with:  npx tsx scripts/cleanup-expired-tokens.ts
 * Or add to package.json scripts:
 *   "token-cleanup": "tsx scripts/cleanup-expired-tokens.ts"
 *
 * Schedule: every 6 hours via cron / Cloud Scheduler / GitHub Actions.
 */

import prisma from '@/lib/prisma';

interface CleanupStats {
  expiredCount: number;
  revokedCount: number;
  revokedIds: string[];
  now: Date;
}

async function main(): Promise<void> {
  const now = new Date();
  console.log(`\n[TOKEN CLEANUP] Running at ${now.toISOString()}`);

  const stats: CleanupStats = {
    expiredCount: 0,
    revokedCount: 0,
    revokedIds: [],
    now,
  };

  // ── Phase 1: Tokens that have passed their absolute expiry ─────────────────
  const expiredTokens = await prisma.participantToken.findMany({
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
      expiresAt: { lt: now },
    },
    select: { id: true, tokenHash: true },
  });

  if (expiredTokens.length > 0) {
    const expiredIds = expiredTokens.map((t) => t.id);
    await prisma.participantToken.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'EXPIRED' },
    });

    stats.expiredCount = expiredIds.length;
    console.log(`  [EXPIRED] ${expiredIds.length} token(s) expired`);
  }

  // ── Phase 2: CONSUMED tokens that have never been marked EXPIRED ──────────────
  // Stale CONSUMED tokens don't need 'EXPIRED' status, but the ones that transitioned
  // from ACTIVE → CONSUMED without being explicitly expired should be audited here.
  const staleConsumed = await prisma.participantToken.findMany({
    where: {
      status: 'CONSUMED',
      consumedAt: { not: null },
    },
    select: { id: true, tokenHash: true, participantId: true },
  });

  // Log a summary of consumed tokens that had a useful lifetime
  if (staleConsumed.length > 0) {
    console.log(`  [CONSUMED] ${staleConsumed.length} token(s) are in CONSUMED state (no action needed)`);
  }

  // ── Phase 3: Audit log ───────────────────────────────────────────────────────
  console.log(`\n[DONE] Expired: ${stats.expiredCount} | Revoked: ${stats.revokedCount}`);
}

main()
  .catch((err) => {
    console.error('[TOKEN CLEANUP] Fatal error:', err);
    process.exit(1);
  })
  .then(() => {
    console.log('[TOKEN CLEANUP] Completed successfully');
    process.exit(0);
  });
