/**
 * Centralized logger. In production, log/debug are no-ops to avoid PHI or sensitive payloads in console.
 * Do not log full API payloads or user data in production.
 */

import { isProd } from '@/config/env';

const noop: (...args: unknown[]) => void = () => {};

export const logger = isProd
  ? {
      log: noop,
      debug: noop,
      info: noop,
      warn: noop,
      error: noop,
    }
  : {
      log: (...args: unknown[]) => console.log(...args),
      debug: (...args: unknown[]) => console.debug(...args),
      info: (...args: unknown[]) => console.info(...args),
      warn: (...args: unknown[]) => console.warn(...args),
      error: (...args: unknown[]) => console.error(...args),
    };
