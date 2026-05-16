/**
 * Testing Patterns Reference
 *
 * Derived from all test files and jest.setup.ts in this codebase.
 * This is a read-only reference — not a runnable file.
 *
 * Contents:
 *   1. What jest.setup.ts provides globally (auto-available in every test)
 *   2. Component tests
 *   3. Hook tests
 *   4. Utility tests (pure + localStorage)
 *   5. API route tests
 *   6. Accessibility testing with jest-axe
 *   7. API mocking with MSW (available but unused — use when fetch mocking gets complex)
 */

// =============================================================================
// 1. GLOBAL SETUP  (jest.setup.ts — active in every test automatically)
// =============================================================================
//
// The following are already configured — you do NOT need to set them up per test:
//
//   @testing-library/jest-dom matchers     → toBeInTheDocument, toHaveClass, …
//   jest-axe/extend-expect                 → toHaveNoViolations
//
//   next/navigation mock                   → useRouter, useSearchParams, usePathname
//     useRouter().push / replace / back    → jest.fn()
//     useSearchParams().get                → jest.fn() returning undefined by default
//
//   localStorage mock                      → in-memory store; survives between calls
//     → always call localStorage.clear() in beforeEach to reset state
//
//   window.matchMedia mock                 → prevents "not a function" errors in jsdom
//
//   console.error / console.warn           → jest.fn()
//     → expect(console.error).toHaveBeenCalled() works without extra setup
//     → suppress noise; restore with jest.spyOn if you need the real output


// =============================================================================
// 2. COMPONENT TESTS
// =============================================================================
//
// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import MyComponent from './MyComponent';
//
// // Mock complex external data at the top of the file as a typed const
// const mockRates: ExchangeRates = {
//   base: 'USD',
//   rates: { USD: 1, EUR: 0.85 },
//   timestamp: Date.now(),
// };
//
// describe('MyComponent', () => {
//   // defaultProps: define ALL required props once.
//   // Each test overrides only what it needs — the rest stays quiet.
//   const defaultProps = {
//     value: 'test',
//     onChange: jest.fn(),
//     exchangeRates: mockRates,
//     onSubmit: jest.fn(),
//   };
//
//   beforeEach(() => {
//     jest.clearAllMocks();  // reset call counts between tests
//   });
//
//   // --- rendering ---
//   it('renders correctly with default props', () => {
//     render(<MyComponent {...defaultProps} />);
//     expect(screen.getByPlaceholderText('TODO')).toBeInTheDocument();
//   });
//
//   it('does not render section when data is null', () => {
//     render(<MyComponent {...defaultProps} exchangeRates={null} />);
//     // queryBy* (not getBy*) when asserting absence — getBy* throws on miss
//     expect(screen.queryByText(/Rate:/)).not.toBeInTheDocument();
//   });
//
//   // --- interaction ---
//   // Always use userEvent over fireEvent — it simulates real browser events
//   it('calls onChange when input changes', async () => {
//     const user = userEvent.setup();  // call setup() once per test
//     render(<MyComponent {...defaultProps} />);
//
//     await user.clear(screen.getByPlaceholderText('TODO'));
//     await user.type(screen.getByPlaceholderText('TODO'), 'new value');
//
//     expect(defaultProps.onChange).toHaveBeenCalled();
//   });
//
//   it('calls onSubmit when button is clicked', async () => {
//     const user = userEvent.setup();
//     render(<MyComponent {...defaultProps} />);
//
//     await user.click(screen.getByRole('button', { name: /submit/i }));
//
//     expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
//   });
//
//   it('selects a dropdown option', async () => {
//     const user = userEvent.setup();
//     render(<MyComponent {...defaultProps} />);
//
//     // getAllByRole when there are multiple comboboxes; pick by index
//     const selects = screen.getAllByRole('combobox');
//     await user.selectOptions(selects[0], 'EUR');
//
//     expect(defaultProps.onChange).toHaveBeenCalledWith('EUR');
//   });
//
//   // --- conditional styling ---
//   it('applies error class when error prop is set', () => {
//     render(<MyComponent {...defaultProps} error="bad input" />);
//     expect(screen.getByRole('textbox')).toHaveClass('border-red-300');
//   });


// =============================================================================
// 3. HOOK TESTS
// =============================================================================
//
// import { renderHook, act, waitFor } from '@testing-library/react';
// import { useMyHook } from './useMyHook';
// import * as storage from '@/utils/storage';
//
// // Module-level mock — replaces the entire module with jest.fn() stubs.
// // Must be at the top of the file, outside describe blocks.
// jest.mock('@/utils/storage');
//
// // For fetch-based hooks: mock global.fetch at module level
// global.fetch = jest.fn();
//
// describe('useMyHook', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     localStorage.clear();
//     // Set default return values for module mocks
//     (storage.getConversionHistory as jest.Mock).mockReturnValue([]);
//   });
//
//   // --- initial state ---
//   it('initialises with default values', () => {
//     const { result } = renderHook(() => useMyHook(null));
//     expect(result.current.value).toBe('');
//   });
//
//   // --- synchronous state changes: wrap in act() ---
//   it('updates state when setter is called', () => {
//     const { result } = renderHook(() => useMyHook(null));
//
//     act(() => {
//       result.current.setValue('hello');
//     });
//
//     expect(result.current.value).toBe('hello');
//   });
//
//   // --- async state changes: use waitFor() ---
//   it('computes result after state settles', async () => {
//     const { result } = renderHook(() => useMyHook(mockExternalData));
//
//     act(() => {
//       result.current.setValue('100');
//     });
//
//     await waitFor(() => {
//       expect(result.current.result).toBe(85);
//     });
//   });
//
//   // --- fetch-based hooks: assert loading → loaded transition ---
//   it('fetches data on mount and updates loading state', async () => {
//     (global.fetch as jest.Mock).mockResolvedValueOnce({
//       json: async () => ({ success: true, data: mockData }),
//     });
//
//     const { result } = renderHook(() => useMyFetch());
//
//     // Immediately after render: loading is true
//     expect(result.current.loading).toBe(true);
//
//     await waitFor(() => {
//       expect(result.current.loading).toBe(false);
//     });
//
//     expect(result.current.data).toEqual(mockData);
//   });
//
//   // --- testing isMounted cleanup ---
//   it('does not update state after unmount', async () => {
//     let resolvePromise!: (v: any) => void;
//     const pending = new Promise((r) => { resolvePromise = r; });
//
//     (global.fetch as jest.Mock).mockReturnValueOnce(pending);
//
//     const { result, unmount } = renderHook(() => useMyFetch());
//     expect(result.current.loading).toBe(true);
//
//     unmount();  // trigger cleanup → isMounted = false
//
//     resolvePromise({ json: async () => ({ success: true, data: mockData }) });
//     await new Promise((r) => setTimeout(r, 100));  // let microtasks flush
//
//     // State must not have changed after unmount
//     expect(result.current.loading).toBe(true);
//   });
//
//   // --- asserting calls to mocked modules ---
//   it('saves to storage after conversion', async () => {
//     const { result } = renderHook(() => useMyHook(mockExternalData));
//
//     act(() => { result.current.setValue('100'); });
//
//     await waitFor(() => { expect(result.current.result).not.toBeNull(); });
//
//     expect(storage.saveConversion).toHaveBeenCalledWith(
//       expect.objectContaining({ amount: 100, result: 85 })
//       // expect.objectContaining checks a subset of the object
//     );
//   });
//
//   // NOTE: next/navigation (useRouter, useSearchParams) is globally mocked in
//   // jest.setup.ts — no extra setup needed in hook tests that use routing.


// =============================================================================
// 4. UTILITY TESTS
// =============================================================================

// --- 4a. Pure functions (no setup needed) ---
//
// describe('myUtil', () => {
//   describe('computeResult', () => {
//     it('returns correct value',    () => expect(computeResult(10, 2)).toBe(20));
//     it('handles decimals',         () => expect(computeResult(0.5, 3)).toBeCloseTo(1.5, 5));
//     it('handles same-unit input',  () => expect(computeResult(1, 1)).toBe(1));
//   });
//
//   describe('validateInput', () => {
//     it('accepts valid value',       () => expect(validateInput('5')).toEqual({ isValid: true }));
//     it('rejects empty string',      () => expect(validateInput('')).toMatchObject({ isValid: false }));
//     it('rejects NaN',               () => expect(validateInput('abc')).toMatchObject({ isValid: false }));
//     it('rejects zero',              () => expect(validateInput('0')).toMatchObject({ isValid: false }));
//   });
// });

// --- 4b. localStorage utils ---
//
// beforeEach(() => {
//   localStorage.clear();    // reset in-memory mock between tests
//   jest.clearAllMocks();
// });
//
// // Simulate localStorage quota error
// it('does not throw when setItem fails', () => {
//   const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
//     throw new Error('QuotaExceededError');
//   });
//
//   expect(() => saveItem({ id: '1', value: 'x' })).not.toThrow();
//
//   spy.mockRestore();  // always restore spies to avoid test bleed
// });
//
// // Assert that console.error was called (globally mocked in jest.setup.ts)
// it('logs error on corrupted data', () => {
//   localStorage.setItem('my_key', 'not valid json{{');
//   getItems();
//   expect(console.error).toHaveBeenCalled();
// });


// =============================================================================
// 5. API ROUTE TESTS
// =============================================================================
//
// /**
//  * @jest-environment node
//  *
//  * REQUIRED for route handlers — NextRequest/NextResponse are Node.js APIs.
//  * Without this directive the test runs in jsdom and the import fails.
//  */
// import { GET } from './route';
// import { NextRequest } from 'next/server';
//
// global.fetch = jest.fn();
//
// describe('GET /api/resource', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     (global.fetch as jest.Mock).mockClear();
//   });
//
//   it('returns 200 on success', async () => {
//     (global.fetch as jest.Mock).mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({ id: '1', value: 42 }),
//     });
//
//     const res  = await GET(new NextRequest('http://localhost:3000/api/resource'));
//     const body = await res.json();
//
//     expect(res.status).toBe(200);
//     expect(body.success).toBe(true);
//     expect(body.data).toHaveProperty('id');
//   });
//
//   it('falls back gracefully when upstream fails', async () => {
//     (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
//
//     const res  = await GET(new NextRequest('http://localhost:3000/api/resource'));
//     const body = await res.json();
//
//     expect(res.status).toBe(200);   // fallback, not 500
//     expect(body.success).toBe(true);
//   });
//
//   it('sets Cache-Control header', async () => {
//     (global.fetch as jest.Mock).mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({}),
//     });
//
//     const res = await GET(new NextRequest('http://localhost:3000/api/resource'));
//     expect(res.headers.get('Cache-Control')).toContain('s-maxage=');
//   });
//
//   it('slow test with extended timeout', async () => {
//     // ...
//   }, 15_000);  // override Jest's default 5s timeout as third argument


// =============================================================================
// 6. ACCESSIBILITY TESTING WITH JEST-AXE
// =============================================================================
//
// jest-axe/extend-expect is imported in jest.setup.ts — toHaveNoViolations is
// available in every component test without any extra import.
//
// import { axe } from 'jest-axe';
// import { render } from '@testing-library/react';
// import MyComponent from './MyComponent';
//
// it('has no accessibility violations', async () => {
//   const { container } = render(<MyComponent {...defaultProps} />);
//   const results = await axe(container);
//   expect(results).toHaveNoViolations();
// });
//
// Tips:
// - Run axe on the rendered container, not on screen queries
// - One axe test per component is enough — it covers the full subtree
// - Axe is slow; keep axe tests separate from interaction tests


// =============================================================================
// 7. API MOCKING WITH MSW  (alternative to global.fetch mocking)
// =============================================================================
//
// MSW (msw v2) is installed. Use it when:
//   - multiple fetch calls need different responses in the same test
//   - you want to test the full request/response cycle including headers
//   - global.fetch mocking becomes hard to follow across many tests
//
// Setup (create once per test suite, e.g. hooks/__mocks__/server.ts):
//
// import { http, HttpResponse } from 'msw';
// import { setupServer } from 'msw/node';
//
// export const server = setupServer(
//   http.get('/api/rates', () =>
//     HttpResponse.json({ success: true, data: { base: 'USD', rates: { EUR: 0.85 } } })
//   ),
// );
//
// In the test file:
//
// import { server } from './__mocks__/server';
//
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());  // reset per-test overrides
// afterAll(() => server.close());
//
// // Override for a specific test:
// it('handles API error', async () => {
//   server.use(
//     http.get('/api/rates', () => HttpResponse.json({ success: false }, { status: 500 }))
//   );
//   // ... test body
// });


// =============================================================================
// QUICK-REFERENCE TABLE
// =============================================================================
//
// | Scenario                          | Tool / pattern                          |
// |-----------------------------------|-----------------------------------------|
// | Find element (must exist)         | screen.getBy*                           |
// | Find element (may be absent)      | screen.queryBy* + not.toBeInTheDocument |
// | Wait for async DOM change         | await screen.findBy*                    |
// | Simulate user interaction         | userEvent.setup() → await user.click()  |
// | Change hook state synchronously   | act(() => { result.current.fn() })      |
// | Wait for hook async state         | await waitFor(() => expect(...))        |
// | Mock a module                     | jest.mock('@/path/to/module')           |
// | Mock one function in a module     | jest.spyOn(module, 'fn').mockReturnValue|
// | Restore a spy                     | spy.mockRestore()                       |
// | Assert partial object match       | expect.objectContaining({ key: value }) |
// | Assert floating point             | toBeCloseTo(value, decimalPlaces)       |
// | Assert accessibility              | await axe(container) + toHaveNoViolations|
// | Test API routes                   | @jest-environment node + NextRequest    |
