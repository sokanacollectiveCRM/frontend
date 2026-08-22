/**
 * Safe structured logging for the SPA. Never pass PHI, tokens, URLs with query
 * params, request/response bodies, or raw provider errors — metadata only.
 */
import { logger } from './logger';

export type SafeLogMeta = Record<
  string,
  string | number | boolean | null | undefined
>;

export function logOperation(
  scope: string,
  operation: string,
  meta?: SafeLogMeta
): void {
  logger.debug({ scope, operation, ...meta });
}

export function logFailure(
  scope: string,
  operation: string,
  meta?: SafeLogMeta
): void {
  logger.error({ scope, operation, ...meta });
}

/** HTTP helper — status code only; never log response text or headers. */
export function logHttpFailure(
  scope: string,
  operation: string,
  status: number
): void {
  logFailure(scope, operation, { status });
}
