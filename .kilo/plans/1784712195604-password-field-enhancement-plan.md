# Password Field Enhancement Plan

## Context
Frontend currently has plain password inputs in `AuthPage.jsx` with no visibility toggle, no strength indicator, and only a 6-character minimum check on register. Backend (`/auth/register`) enforces stricter rules: minimum 8 characters, uppercase, lowercase, number, and special character. When backend rejects a password, it returns structured validation errors but the current frontend surfaces only the generic "Validation failed" message.

## Goals
1. Add show/hide password toggle to all password fields in AuthPage
2. Add real-time password strength indicator for the register password field
3. Detect backend password complexity rejection and display a specific "A stronger password is required" message with the exact missing requirements
4. Align frontend and backend password validation rules (document and reconcile)

---

## Tasks

### Task 1: Create `src/utils/passwordStrength.js`
- Export a `checkPasswordStrength(password)` function
- Returns an object: `{ score, level, label, requirements }`
- `requirements` is an object with boolean flags for: `length`, `uppercase`, `lowercase`, `number`, `specialChar`
- `level` is one of: `"weak"`, `"fair"`, `"good"`, `"strong"`
- `label` is the human-readable level (e.g., "Weak", "Fair")
- `score` is 0-5 based on met requirements
- Level mapping: 0-1 = weak, 2 = fair, 3 = good, 4-5 = strong

### Task 2: Enhance `src/utils/errorHandler.js`
- Add `getPasswordValidationError(error)` helper
- Inspects `error.response?.data?.errors` for entries where `field === "password"`
- If found, returns a formatted string like: "A stronger password is required. Please ensure your password has: [missing requirements]"
- If no password-specific error, returns `null` so `getErrorMessage` can fall through to existing behavior
- Also update the existing `getErrorMessage` to check for structured `errors` array when `message === "Validation failed"` and surface the first relevant error

### Task 3: Modify `src/AuthPage.jsx`
- Add three visibility states: `showLoginPassword`, `showRegPassword`, `showConfirmPassword` (defaults to `false`)
- Add `passwordStrength` state for the register password field
- Add a `passwordRequirements` state or compute it inline
- On register password `onChange`, compute strength using the new utility and update state
- Add toggle buttons (eye / eye-off SVG icons) inside each `.input-field` div, positioned on the right
- Render the strength meter below the register password input:
  - A horizontal bar that fills proportionally to score
  - Color changes by level (red, orange, yellow, green)
  - Text label
- Replace the hardcoded frontend validation (`regPassword.length < 6`) with a check matching backend rules, OR remove it and let backend enforce (recommended: mirror backend rules client-side for better UX, but keep backend as truth)
- In the `handleRegister` catch block, first check for password-specific backend errors and display the enhanced message; otherwise fall back to `getErrorMessage`
- In the error display section, when the error is a password validation error, add a distinct styling class

### Task 4: Modify `src/AuthPage.css`
- Add `.password-toggle` styles:
  - `position: absolute; right: 12px;` (so it needs `.input-field` to have `position: relative`)
  - Transparent background, cursor pointer, color matches existing icon color
  - Hover color change
- Add `.input-field.has-toggle` adjustment so input has right padding to not overlap toggle
- Add `.password-strength-meter` styles below the register password field:
  - Outer container with margin-top
  - Progress bar container (thin, rounded, background rgba)
  - Progress bar fill (animated width transition, colored by level)
  - Status text with font-size 12px, margin-top 4px
- Add modifier classes for colors:
  - `.strength-weak`, `.strength-fair`, `.strength-good`, `.strength-strong`
- Reuse existing card/form spacing/gap patterns

---

## Validation & Compatibility Check

### Backend rules (source of truth)
| Rule | Backend |
|------|---------|
| Min length | 8 characters |
| Uppercase | Required |
| Lowercase | Required |
| Number | Required |
| Special char | Required (`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`) |

### Frontend current rules
| Rule | Frontend |
|------|---------|
| Min length | 6 characters |
| Uppercase | Not checked |
| Lowercase | Not checked |
| Number | Not checked |
| Special char | Not checked |

### Discrepancy
- Frontend allows 6-7 character passwords that backend will reject
- Frontend passes backend errors to user only as generic "Validation failed" without actionable details

### Sync decision
1. Update client-side minimum to 8 characters (or remove it and rely on backend + strength meter)
2. Mirror the 5 backend rules in the real-time strength meter and in structured validation errors
3. Backend remains the authoritative rejector

---

## Edge Cases
- Empty password: strength score 0, level "weak"
- Backend returns validation errors for non-password fields: do not apply the "stronger password required" wrapper
- User toggles visibility rapidly: state updates should be instant and not cause re-render issues
- Strength meter should update on every keystroke (or debounce slightly for performance if needed)

---

## Files to Change
| File | Action |
|------|--------|
| `src/utils/passwordStrength.js` | Create |
| `src/utils/errorHandler.js` | Modify |
| `src/AuthPage.jsx` | Modify |
| `src/AuthPage.css` | Modify |

---

## Open Questions / Decisions Needed
None. Plan is ready for implementation.
