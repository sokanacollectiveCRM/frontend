/**
 * Centralized logger. In production, log/debug are no-ops to avoid PHI or sensitive payloads in console.
 * Do not log full API payloads or user data in production.
 */

import { isProd } from '@/config/env';

function noop(_?: unknown, ..._args: unknown[]): void {}

export const logger = isProd
  ? {
      log: noop,
      debug: noop,
      info: noop,
      warn: (...args: unknown[]) => {
        /* Only allow minimal, non-PHI warnings in prod if needed */
        if (typeof args[0] === 'string' && !args[0].includes('phone') && !args[0].includes('email') && !args[0].includes('address')) {
          console.warn(args[0]);
        }
      },
      error: (...args: unknown[]) => {
        /* Log error type/message only, never full payloads */
        const msg = args[0] instanceof Error ? args[0].message : String(args[0]);
        console.error(msg);
      },
    }
  : {
      log: (...args: unknown[]) => console.log(...args),
      debug: (...args: unknown[]) => console.debug(...args),
      info: (...args: unknown[]) => console.info(...args),
      warn: (...args: unknown[]) => console.warn(...args),
      error: (...args: unknown[]) => console.error(...args),
    };
