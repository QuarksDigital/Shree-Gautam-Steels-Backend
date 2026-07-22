/**
 * Minimal structured logger. Kept dependency-free so it works everywhere.
 * Swap for pino/winston if richer logging is needed later.
 */
type Level = 'info' | 'warn' | 'error' | 'debug';

const stamp = (): string => new Date().toISOString();

const write = (level: Level, message: string, meta?: unknown): void => {
  const base = `[${stamp()}] ${level.toUpperCase()} ${message}`;
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](base, meta);
  } else {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](base);
  }
};

export const logger = {
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
};
