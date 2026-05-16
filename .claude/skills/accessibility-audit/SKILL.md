---
name: accessibility-audit
description: Check for accessibility issues in React components. Scans for missing ARIA labels, unassociated form labels, non-semantic interactive elements, decorative images without aria-hidden, and missing jest-axe coverage. Reports findings by severity with specific fixes.
---

# Accessibility Audit

Scan the codebase for accessibility issues and report findings with severity levels and concrete fixes. Targets WCAG 2.1 AA compliance.

## When to Use

- User asks to "check accessibility", "audit a11y", or "find accessibility issues"
- User asks about ARIA, labels, keyboard navigation, or screen reader support
- Before merging a PR that adds or changes UI components
- User asks to add jest-axe tests to components

## How It Works

### Phase 1: Automated Scan

Read every `.tsx` file in `components/` and `app/` (skip `node_modules`, `.next`).
For each file check the items below. Run reads in parallel where possible.

**1. Form labels**
- `<input>`, `<select>`, `<textarea>` without an associated `<label htmlFor="...">` + matching `id="..."` → **HIGH**
- `<label>` rendered without `htmlFor` → **HIGH** (visually present but not programmatically linked)
- Inputs with `aria-label` or `aria-labelledby` are acceptable alternatives → skip

**2. Interactive elements**
- `<div>`, `<span>`, `<li>` with `onClick` → **HIGH** (use `<button>` or add `role="button"` + `tabIndex={0}` + keyboard handler)
- `<button>` with no visible text AND no `aria-label` AND no `title` → **HIGH**
- Icon-only buttons with `aria-label` or `title` → acceptable → skip

**3. Images and SVGs**
- `<img>` without `alt` → **HIGH**
- `<img alt="">` is acceptable for decorative images → skip
- Decorative `<svg>` (inside a button or label that already has text/aria-label) without `aria-hidden="true"` → **MEDIUM**
- Standalone `<svg>` with no `aria-label` and no `aria-hidden` → **MEDIUM**

**4. Heading hierarchy**
- Read `app/page.tsx` and component files. Map all `<h1>`–`<h6>` tags.
- Multiple `<h1>` on the page → **MEDIUM**
- Skipped heading level (e.g. h1 → h3) → **MEDIUM**

**5. Colour and focus**
- Elements with `focus:outline-none` and no custom `focus:ring-*` replacement → **MEDIUM** (focus indicator removed)
- Elements with `focus:outline-none` + `focus:ring-*` → acceptable → skip

**6. jest-axe coverage**
- Check all `*.test.tsx` files in `components/` for `toHaveNoViolations`.
- Components with no axe test → **LOW** (easy win — one test covers the whole subtree)

### Phase 2: Compile Report

Group findings by severity. For each finding include:
- File path and line number (if determinable from static scan)
- What the issue is
- Why it matters (which WCAG criterion, which users are affected)
- Exact fix — show the before/after code diff

Severity levels:
- **HIGH** — blocks screen reader or keyboard users entirely
- **MEDIUM** — degrades experience or fails automated checks
- **LOW** — best-practice gap; easy to fix

### Phase 3: jest-axe Recommendations

For every component that lacks a `toHaveNoViolations` test, output a ready-to-paste test block:

```tsx
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import MyComponent from './MyComponent';

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent {...minimalProps} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

Note: `jest-axe/extend-expect` is already imported globally in `jest.setup.ts` — no extra import needed.

## Output Format

```
## Accessibility Audit Report

### HIGH — [count] issues
---
[Component.tsx:line] Missing form label association
  Issue:   <label> rendered without htmlFor; <select> has no id
  Affects: screen reader users — input purpose is not announced
  WCAG:    1.3.1 Info and Relationships
  Fix:
    - <label className="...">From</label>
    + <label htmlFor="from-currency" className="...">From</label>
    - <select value={value} ...>
    + <select id="from-currency" value={value} ...>

### MEDIUM — [count] issues
---
...

### LOW — [count] issues
---
...

### jest-axe coverage gaps — [count] components
---
[Component.tsx] — no toHaveNoViolations test
  → Add to Component.test.tsx:
  [ready-to-paste test block]
```

## Known Issues in This Codebase

Found during skill creation — address these first:

| File | Issue | Severity |
|------|-------|----------|
| `components/CurrencySelect.tsx` | `<label>` has no `htmlFor`; `<select>` has no `id` | HIGH |
| `components/AmountInput.tsx` | `<label>` has no `htmlFor`; `<input>` has no `id` | HIGH |
| `components/ConversionHistory.tsx` | `<div onClick>` used for clickable history items instead of `<button>` | HIGH |
| `components/CurrencySelect.tsx:29` | Decorative `<svg>` (chevron) missing `aria-hidden="true"` | MEDIUM |
| All components | No `toHaveNoViolations` jest-axe test in any component test file | LOW |

## Best Practices

1. **Static scan first, then suggest axe tests** — static analysis catches structural issues; axe catches runtime issues the static scan may miss.
2. **Show exact diffs** — don't describe the fix in prose; show the before/after code.
3. **Don't audit node_modules or .next** — only scan source files.
4. **Skip false positives** — `aria-label` on a button satisfies the label requirement even without visible text; don't flag it.
5. **One axe test per component is enough** — axe traverses the full rendered subtree.

## Examples

### Example 1: Full audit
**User**: "check accessibility" / "audit a11y" / "find accessibility issues"
**Action**: Run all three phases across all components, produce full report
**Output**: Grouped findings by severity + jest-axe blocks for uncovered components

### Example 2: Single component
**User**: "check accessibility of CurrencySelect"
**Action**: Run phases 1–2 on `components/CurrencySelect.tsx` only, plus phase 3 for its test file
**Output**: Findings for that component only

### Example 3: Add axe tests
**User**: "add jest-axe tests to all components"
**Action**: Run phase 3 only — scan for missing coverage and output ready-to-paste test blocks
**Output**: One test block per component that lacks `toHaveNoViolations`
