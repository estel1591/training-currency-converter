/**
 * Custom Hook Template
 *
 * Derived from useExchangeRates and useConverter in this codebase.
 * Copy the section that matches your use case and fill in the TODOs.
 */

import { useState, useEffect, useCallback } from 'react';
// Add useRouter / useSearchParams if you need URL sync (see Pattern B)

// ---------------------------------------------------------------------------
// PATTERN A — Data-fetching hook  (modelled after useExchangeRates)
//
// Use when: the hook owns a single async fetch with no arguments.
// Returns:  { data, loading, error }
// ---------------------------------------------------------------------------

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useMyFetch<T>(): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // isMounted prevents setState calls after the component unmounts.
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: replace with real fetch
        const response = await fetch('/api/TODO');
        const json = await response.json();

        if (!isMounted) return;

        if (!json.success) {
          throw new Error(json.error || 'Request failed');
        }

        setData(json.data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message ?? 'Something went wrong');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // cleanup — runs on unmount
    };
  }, []); // empty array = fire once on mount

  return { data, loading, error };
}

// ---------------------------------------------------------------------------
// PATTERN B — Stateful logic hook  (modelled after useConverter)
//
// Use when: the hook manages multiple related state fields, handles user
// interactions, and optionally syncs with the URL or external storage.
//
// Takes:   external data produced by another hook (e.g. a fetch hook)
// Returns: state fields + memoised handlers
// ---------------------------------------------------------------------------

// TODO: replace with your actual type
interface MyExternalData {
  [key: string]: unknown;
}

interface MyHookReturn {
  // --- state ---
  inputValue: string;
  result: string | null;
  validationError: string | null;
  // --- handlers ---
  setInputValue: (value: string) => void;
  handleSubmit: () => void;
  handleReset: () => void;
}

export function useMyLogic(externalData: MyExternalData | null): MyHookReturn {
  // 1. Declare state at the top
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 2. Side effects: initialise from URL params, localStorage, etc.
  useEffect(() => {
    // TODO: e.g. read searchParams or localStorage and seed state
  }, []); // run once on mount

  // 3. Reactive side effect: re-run business logic when inputs change
  useEffect(() => {
    if (!externalData || !inputValue) return;

    // TODO: validate + compute result
    setResult(`computed from ${inputValue}`);
  }, [inputValue, externalData]);

  // 4. Memoised handlers — useCallback prevents child re-renders
  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) {
      setValidationError('Input is required');
      return;
    }
    setValidationError(null);
    // TODO: perform action
  }, [inputValue]);

  const handleReset = useCallback(() => {
    setInputValue('');
    setResult(null);
    setValidationError(null);
  }, []);

  // 5. Return both state and handlers as a plain object (not an array)
  return {
    inputValue,
    result,
    validationError,
    setInputValue,
    handleSubmit,
    handleReset,
  };
}

// ---------------------------------------------------------------------------
// CHECKLIST before shipping a new hook
// ---------------------------------------------------------------------------
//
// [ ] State declared at the top, typed with generics where possible
// [ ] Async effects use an isMounted flag and return a cleanup function
// [ ] Handlers wrapped in useCallback; dependency arrays are complete
// [ ] Hook takes external data as an argument instead of fetching it again
// [ ] Return value is a plain object { ... }, not an array
// [ ] New type interfaces added to types/index.ts, not defined inline
// [ ] Hook file has a colocated test: hooks/useMyHook.test.ts
// [ ] Hook exported from hooks/index.ts barrel
