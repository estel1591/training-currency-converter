/**
 * Utility Template
 *
 * Derived from utils/currency.ts and utils/storage.ts in this codebase.
 * Copy the section that matches your use case and fill in the TODOs.
 */

import { /* TODO: add types from @/types */ } from '@/types';

// ---------------------------------------------------------------------------
// PATTERN A — Pure utility functions  (modelled after utils/currency.ts)
//
// Use when: the functions are stateless, deterministic, and have no side
// effects (no fetch, no localStorage, no DOM). Safe to call anywhere,
// including SSR and tests with no mocking.
//
// Exports:  constants + named functions
// ---------------------------------------------------------------------------

// Module-level constants — name them in UPPER_SNAKE_CASE
const TODO_DEFAULT_VALUE = 0;

// -- Lookup --

/**
 * Find an item by a key. Returns undefined when not found.
 */
export function findByKey<T extends { id: string }>(
  items: T[],
  key: string
): T | undefined {
  return items.find((item) => item.id === key);
}

// -- Formatter --

/**
 * Format a value for display. Always returns a string.
 */
export function formatValue(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

// -- Validator --
//
// Returns { isValid, error } — never throws.
// The caller decides what to do with the error message.

export function validateInput(value: string): { isValid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Value is required' };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (num <= TODO_DEFAULT_VALUE) {
    return { isValid: false, error: 'Must be greater than zero' };
  }

  return { isValid: true };
}

// -- Computation --

/**
 * Pure computation. Name it after what it calculates, not how.
 */
export function computeResult(input: number, factor: number): number {
  return input * factor;
}

// ---------------------------------------------------------------------------
// PATTERN B — Side-effectful utilities  (modelled after utils/storage.ts)
//
// Use when: the function reads/writes to localStorage, sessionStorage, cookies,
// or other browser APIs that are unavailable in Node/SSR.
//
// Rules:
//  1. Always guard with `typeof window === 'undefined'` before touching browser APIs.
//  2. Wrap every operation in try/catch — storage can throw (quota, private mode).
//  3. Return a safe fallback (empty array, null, void) on failure — never rethrow.
//  4. Keep keys and size limits as module-level constants.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'my_feature_key';   // TODO: replace with your key
const MAX_ITEMS   = 10;                 // TODO: adjust as needed

// TODO: replace with your item type from @/types
interface MyItem {
  id: string;
  value: unknown;
}

/**
 * Read all items from localStorage. Returns [] when unavailable or corrupt.
 */
export function getItems(): MyItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as MyItem[]) ?? [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

/**
 * Prepend an item. Trims list to MAX_ITEMS. Silently fails on error.
 */
export function saveItem(item: MyItem): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getItems();
    const updated = [item, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Remove all items. Silently fails on error.
 */
export function clearItems(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// ---------------------------------------------------------------------------
// TEST SKELETON  (place in utils/myUtil.test.ts)
// ---------------------------------------------------------------------------
//
// import { findByKey, formatValue, validateInput, computeResult } from './myUtil';
//
// describe('myUtil', () => {
//
//   describe('validateInput', () => {
//     it('accepts a valid value',        () => expect(validateInput('5')).toEqual({ isValid: true }));
//     it('rejects empty string',         () => expect(validateInput('')).toMatchObject({ isValid: false }));
//     it('rejects non-numeric input',    () => expect(validateInput('abc')).toMatchObject({ isValid: false }));
//     it('rejects zero',                 () => expect(validateInput('0')).toMatchObject({ isValid: false }));
//   });
//
//   describe('computeResult', () => {
//     it('returns correct value',        () => expect(computeResult(10, 2)).toBe(20));
//     it('handles decimals',             () => expect(computeResult(0.5, 3)).toBeCloseTo(1.5, 5));
//   });
//
//   // For localStorage utils — mock window or use a fake:
//   describe('getItems / saveItem / clearItems', () => {
//     beforeEach(() => localStorage.clear());
//
//     it('returns [] when storage is empty', () => expect(getItems()).toEqual([]));
//     it('saves and retrieves an item',      () => {
//       saveItem({ id: '1', value: 'test' });
//       expect(getItems()).toHaveLength(1);
//     });
//     it('caps list at MAX_ITEMS',           () => {
//       // TODO: insert MAX_ITEMS+1 items and assert length === MAX_ITEMS
//     });
//   });
// });

// ---------------------------------------------------------------------------
// CHECKLIST before shipping a new utility file
// ---------------------------------------------------------------------------
//
// [ ] Pure functions have no imports from React — they're framework-agnostic
// [ ] Browser-API functions start with a `typeof window === 'undefined'` guard
// [ ] Every localStorage/sessionStorage call is inside try/catch
// [ ] Validators return { isValid, error } — they never throw
// [ ] Constants are UPPER_SNAKE_CASE at module level, not magic literals
// [ ] New types added to types/index.ts, not defined inline
// [ ] Utility file has a colocated test: utils/myUtil.test.ts
// [ ] All exports use named exports (no default export)
