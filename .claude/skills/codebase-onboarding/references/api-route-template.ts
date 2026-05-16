/**
 * API Route Template  (Next.js App Router)
 *
 * Derived from app/api/rates/route.ts in this codebase.
 * Place new routes at:  app/api/<resource>/route.ts
 * Fill in the TODOs and delete sections you don't need.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types'; // shared response envelope

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

// Revalidate cached response every N seconds (Next.js server-side cache).
// Set to 0 to disable caching, or remove the export to use Next.js defaults.
export const revalidate = 3600; // TODO: adjust or remove

// Timeout for outbound fetch calls (ms)
const FETCH_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// FALLBACK DATA  (optional — use when the upstream API may be unavailable)
//
// Hardcoded fallback keeps the app functional during outages / local dev.
// Only include fields that downstream code actually needs.
// ---------------------------------------------------------------------------

const FALLBACK_DATA = {
  // TODO: fill in safe default values
};

// ---------------------------------------------------------------------------
// UPSTREAM FETCH HELPER
//
// Wraps a single outbound call with a timeout and throws on HTTP errors.
// The handler calls this and catches failures — helpers never swallow errors.
// ---------------------------------------------------------------------------

async function fetchUpstream(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'my-app/1.0' }, // TODO: adjust or remove
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Upstream responded with HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error; // re-throw — the handler decides what to do
  }
}

// ---------------------------------------------------------------------------
// TRANSFORM HELPER  (optional)
//
// Converts the upstream payload into the shape the app expects.
// Keeping this separate makes it easy to unit-test without hitting the network.
// ---------------------------------------------------------------------------

function transformResponse(raw: any): Record<string, unknown> {
  return {
    // TODO: map upstream fields to internal fields
    id: raw.id,
    value: raw.value,
  };
}

// ---------------------------------------------------------------------------
// GET HANDLER
//
// Convention:
//   success → 200  { success: true,  data: T }
//   client error → 400  { success: false, error: string }
//   server error → 500  { success: false, error: string }
//
// Cache-Control is set manually on the success response so both CDN edges
// and Next.js's built-in cache honour the same TTL.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    let raw: any;

    try {
      raw = await fetchUpstream('https://TODO.example.com/api/endpoint');
    } catch (upstreamError: any) {
      // Upstream failed — fall back to hardcoded data rather than returning 500.
      // Remove this block if your route has no meaningful fallback.
      console.warn('Upstream fetch failed, using fallback data:', upstreamError.message);
      raw = FALLBACK_DATA;
    }

    const data = transformResponse(raw);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...data,
          timestamp: Date.now(), // clients can show "last updated" info
        },
      },
      {
        headers: {
          // s-maxage: CDN cache TTL  |  stale-while-revalidate: serve stale while refreshing
          'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`,
        },
      }
    );
  } catch (error: any) {
    // Catastrophic failure — nothing to fall back to
    console.error('GET /api/TODO error:', error);

    return NextResponse.json(
      { success: false, error: error.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST HANDLER  (include only if your route accepts writes)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();

    // TODO: validate body fields before using them
    if (!body.value) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: value' },
        { status: 400 }
      );
    }

    // TODO: perform write operation
    const result = { id: 'new-id', ...body };

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/TODO error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// TEST SKELETON  (place in app/api/<resource>/route.test.ts)
// ---------------------------------------------------------------------------
//
// /**
//  * @jest-environment node
//  */
// import { GET } from './route';
// import { NextRequest } from 'next/server';
//
// // Mock global fetch so tests never hit the network
// global.fetch = jest.fn();
//
// const BASE_URL = 'http://localhost:3000/api/TODO';
//
// // Helper to build a mock upstream success response
// function mockUpstreamOk(payload: object) {
//   (global.fetch as jest.Mock).mockResolvedValueOnce({
//     ok: true,
//     json: async () => payload,
//   });
// }
//
// function mockUpstreamFail(message = 'Network error') {
//   (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(message));
// }
//
// describe('GET /api/TODO', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     (global.fetch as jest.Mock).mockClear();
//   });
//
//   // --- happy path ---
//   it('returns 200 with success:true on upstream success', async () => {
//     mockUpstreamOk({ id: '1', value: 42 });
//
//     const res  = await GET(new NextRequest(BASE_URL));
//     const body = await res.json();
//
//     expect(res.status).toBe(200);
//     expect(body.success).toBe(true);
//     expect(body.data).toHaveProperty('id');
//   });
//
//   // --- response shape ---
//   it('includes a timestamp in the response', async () => {
//     mockUpstreamOk({ id: '1', value: 42 });
//     const before = Date.now();
//     const res  = await GET(new NextRequest(BASE_URL));
//     const body = await res.json();
//     const after = Date.now();
//
//     expect(body.data.timestamp).toBeGreaterThanOrEqual(before);
//     expect(body.data.timestamp).toBeLessThanOrEqual(after);
//   });
//
//   // --- caching ---
//   it('sets Cache-Control header on success', async () => {
//     mockUpstreamOk({ id: '1', value: 42 });
//     const res = await GET(new NextRequest(BASE_URL));
//
//     expect(res.headers.get('Cache-Control')).toContain('public');
//     expect(res.headers.get('Cache-Control')).toContain('s-maxage=');
//   });
//
//   // --- fallback ---
//   it('falls back to hardcoded data when upstream fails', async () => {
//     mockUpstreamFail('Network error');
//     const res  = await GET(new NextRequest(BASE_URL));
//     const body = await res.json();
//
//     expect(res.status).toBe(200);   // graceful — not 500
//     expect(body.success).toBe(true);
//     expect(body.data).toBeDefined();
//   });
//
//   // --- upstream HTTP error ---
//   it('treats non-ok upstream status as a failure', async () => {
//     (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 503 });
//     const res  = await GET(new NextRequest(BASE_URL));
//     const body = await res.json();
//
//     // If you have a fallback this should still be 200; without one, 500
//     expect([200, 500]).toContain(res.status);
//     expect(typeof body.success).toBe('boolean');
//   });
//
//   // --- timeout ---
//   it('handles upstream timeout gracefully', async () => {
//     mockUpstreamFail('The operation was aborted');
//     const res  = await GET(new NextRequest(BASE_URL));
//     const body = await res.json();
//
//     expect(body.success).toBe(true); // fallback keeps the app alive
//   }, 15_000); // extend Jest timeout for slow-path tests
// });

// ---------------------------------------------------------------------------
// CHECKLIST before shipping a new API route
// ---------------------------------------------------------------------------
//
// [ ] File is at app/api/<resource>/route.ts
// [ ] HTTP method exported as a named async function (GET, POST, …)
// [ ] Response shape matches ApiResponse from types/index.ts: { success, data?, error? }
// [ ] Success responses include Cache-Control header + export const revalidate
// [ ] Outbound fetch wrapped in AbortController with a timeout
// [ ] Upstream failures fall back gracefully (or return 500 with a clear message)
// [ ] No secrets or env vars hardcoded — use process.env.MY_SECRET
// [ ] Route has a colocated test: app/api/<resource>/route.test.ts
// [ ] Test file starts with /** @jest-environment node */
// [ ] global.fetch mocked — tests never hit real network
