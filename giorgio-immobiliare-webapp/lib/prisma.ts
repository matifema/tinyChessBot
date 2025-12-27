/**
 * Prisma is no longer used after migrating to Cloudflare D1.
 *
 * This file is kept temporarily to avoid breaking imports while the migration
 * is in progress. New code should use D1 via route handlers and shared types
 * from `@/lib/db`.
 */
const prisma = null as never;

export default prisma;
