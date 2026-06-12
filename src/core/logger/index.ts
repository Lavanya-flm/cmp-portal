import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../../config/env';

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

// ─── Custom console format ────────────────────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  const stackStr = stack ? `\n${stack}` : '';
  return `${ts} [${level}] ${message}${metaStr}${stackStr}`;
});

// ─── Transports ───────────────────────────────────────────────────────────────
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize({ all: true }), consoleFormat),
  }),
];

if (env.nodeEnv !== 'test') {
  transports.push(
    new DailyRotateFile({
      dirname: path.join(process.cwd(), env.logger.dir),
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    }),
    new DailyRotateFile({
      dirname: path.join(process.cwd(), env.logger.dir),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    }),
  );
}

// ─── Logger instance ──────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.logger.level,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), splat()),
  transports,
  exitOnError: false,
});

// ─── Stream for morgan integration ────────────────────────────────────────────
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
