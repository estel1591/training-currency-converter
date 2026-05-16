/**
 * Component Template
 *
 * Derived from components/ in this codebase.
 * Copy the section that matches your use case and fill in the TODOs.
 *
 * All components in this project are purely presentational:
 *   - they receive props and fire callbacks
 *   - they hold no business logic (that lives in hooks/)
 *   - they hold no async operations
 */

import { /* TODO: add types from @/types if needed */ } from '@/types';

// ---------------------------------------------------------------------------
// PATTERN A — Leaf / atomic component  (modelled after AmountInput)
//
// Use when: the component renders a single UI element (input, button, label,
// badge…) and is fully controlled by its parent via props.
//
// Rules:
//  - No local state unless it's purely cosmetic (e.g. focus ring toggle).
//  - All callbacks are named onFoo (onFoo mirrors the DOM convention).
//  - Optional props use `?`; nullable values use `T | null`.
//  - Reflect error/disabled state only through className changes — never hide
//    the element entirely from a leaf component.
// ---------------------------------------------------------------------------

interface MyLeafProps {
  value: string;                        // required controlled value
  onChange: (value: string) => void;    // required callback — named onFoo
  label?: string;                       // optional: rendered only when provided
  error?: string | null;                // optional: drives error styling
  disabled?: boolean;                   // optional: forwarded to the element
}

export default function MyLeaf({ value, onChange, label, error, disabled }: MyLeafProps) {
  return (
    <div className="TODO-wrapper">
      {/* Render optional label only when provided */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="TODO"
        className={`TODO-base-classes ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
        }`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PATTERN B — Composite component  (modelled after ConverterForm)
//
// Use when: the component is a section of a page composed of several leaf
// components, and it needs to derive local display values from props
// (not useState — just plain computed variables).
//
// Rules:
//  - Import child components individually, not from the barrel, to keep the
//    dependency graph explicit inside components/.
//  - Compute derived display values above the return as plain `const`s.
//  - Null-check external data with optional chaining before computing.
//  - Guard conditional sections with `&&` (show/hide) or ternary (swap).
// ---------------------------------------------------------------------------

// TODO: import the leaf components this composite uses
// import MyLeaf from './MyLeaf';

interface MyCompositeProps {
  // data props
  value: string;
  items: string[];                      // example: list data from a hook
  result: number | null;
  validationError: string | null;
  externalData: Record<string, number> | null;   // may be null while loading

  // callback props — all named onFoo
  onValueChange: (value: string) => void;
  onReset: () => void;
}

export default function MyComposite({
  value,
  items,
  result,
  validationError,
  externalData,
  onValueChange,
  onReset,
}: MyCompositeProps) {
  // Derived display value — plain const, not useState.
  // Null-check externalData before accessing its fields.
  const displayRate = externalData
    ? externalData['TODO_KEY_A'] / externalData['TODO_KEY_B']
    : null;

  return (
    <div className="space-y-4">
      {/* Primary input area */}
      <div className="flex gap-3">
        {/* TODO: replace with real leaf components */}
        <input value={value} onChange={(e) => onValueChange(e.target.value)} />
        <button onClick={onReset}>Reset</button>
      </div>

      {/* Validation error — shown below the input row */}
      {validationError && (
        <p className="text-sm text-red-600 px-1">{validationError}</p>
      )}

      {/* Result section — hidden when there is a validation error */}
      {!validationError && result !== null && (
        <div className="TODO-result">
          <span>{result}</span>
          {displayRate !== null && (
            <span className="text-sm text-gray-600">Rate: {displayRate}</span>
          )}
        </div>
      )}

      {/* List section — empty-state handled inline */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No items yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="TODO-item">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TEST SKELETON  (place in components/MyComponent.test.tsx)
// ---------------------------------------------------------------------------
//
// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import MyLeaf from './MyLeaf';                  // or MyComposite
//
// // Mock external data at the top of the file as a const
// const mockExternalData = { TODO_KEY_A: 1.5, TODO_KEY_B: 1.0 };
//
// describe('MyLeaf', () => {
//   // defaultProps makes every test opt-in to only the props that matter
//   const defaultProps = {
//     value: 'test-value',
//     onChange: jest.fn(),
//     // optional props omitted — they default to undefined
//   };
//
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//
//   // --- rendering ---
//   it('renders without crashing', () => {
//     render(<MyLeaf {...defaultProps} />);
//     expect(screen.getByPlaceholderText('TODO')).toBeInTheDocument();
//   });
//
//   it('shows label when provided', () => {
//     render(<MyLeaf {...defaultProps} label="My label" />);
//     expect(screen.getByText('My label')).toBeInTheDocument();
//   });
//
//   it('does not show label when omitted', () => {
//     render(<MyLeaf {...defaultProps} />);
//     expect(screen.queryByRole('label')).not.toBeInTheDocument();
//   });
//
//   // --- interaction ---
//   it('calls onChange when value changes', async () => {
//     const user = userEvent.setup();
//     render(<MyLeaf {...defaultProps} />);
//
//     await user.clear(screen.getByPlaceholderText('TODO'));
//     await user.type(screen.getByPlaceholderText('TODO'), 'new value');
//
//     expect(defaultProps.onChange).toHaveBeenCalled();
//   });
//
//   // --- error state ---
//   it('applies error styling when error prop is set', () => {
//     render(<MyLeaf {...defaultProps} error="Something is wrong" />);
//     expect(screen.getByPlaceholderText('TODO')).toHaveClass('border-red-300');
//   });
//
//   it('does not apply error styling when error is null', () => {
//     render(<MyLeaf {...defaultProps} error={null} />);
//     expect(screen.getByPlaceholderText('TODO')).not.toHaveClass('border-red-300');
//   });
//
//   // --- null / edge cases (for composite components) ---
//   it('renders gracefully when externalData is null', () => {
//     render(<MyComposite {...defaultProps} externalData={null} />);
//     expect(screen.getByPlaceholderText('TODO')).toBeInTheDocument();
//     expect(screen.queryByText(/Rate:/)).not.toBeInTheDocument();
//   });
// });

// ---------------------------------------------------------------------------
// CHECKLIST before shipping a new component
// ---------------------------------------------------------------------------
//
// [ ] Props interface defined above the component, typed with @/types where needed
// [ ] All callbacks named onFoo (not handleFoo, not setFoo)
// [ ] No useState for business logic — only cosmetic state (e.g. tooltip open)
// [ ] Null-checked external data before accessing its properties
// [ ] Empty-state handled when rendering lists
// [ ] Conditional rendering uses && (show/hide) or ternary (swap), not early return
// [ ] Component is a default export; added to components/index.ts barrel
// [ ] Component has a colocated test: components/MyComponent.test.tsx
