/**
 * Pattern Detection Module
 *
 * Main entry point for pattern detection functionality
 */
export * from './types';
export * from './utils';
export * from './candles';

export { detectAllCandlePatterns as detectPatterns } from './candles';