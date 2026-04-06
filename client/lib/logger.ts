type Level = "debug" | "info" | "warn" | "error";

export const logger = {
  log(level: Level, ...args: unknown[]) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console[level]("[app]", ...args);
    }
  },
  info: (...args: unknown[]) => logger.log("info", ...args),
  debug: (...args: unknown[]) => logger.log("debug", ...args),
  warn: (...args: unknown[]) => logger.log("warn", ...args),
  error: (...args: unknown[]) => logger.log("error", ...args),
};