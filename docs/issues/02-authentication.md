# Issue 2: Authentication — register & login

## What to build

Full authentication flow end-to-end: registration page, login page, persistent sessions, and logout. All routes except `/login` and `/register` are protected — unauthenticated users are redirected to `/login`. UI built with shadcn/ui Form, Input, Button, and Card components, styled to the Witness design system (dark surfaces, Electric Lime CTA).

## Acceptance criteria

- [ ] `/register` page accepts loginId + password, creates a User via Better Auth, redirects to `/today` on success
- [ ] `/login` page accepts loginId + password, creates a session, redirects to `/today` on success
- [ ] Invalid credentials show an inline error message (shadcn/ui form validation)
- [ ] Session persists across browser refreshes
- [ ] Logout button destroys the session and redirects to `/login`
- [ ] All app routes (except `/login`, `/register`) redirect unauthenticated users to `/login`
- [ ] Pages are styled with dark background (`#0A0A0F`), Electric Lime primary button, Space Grotesk headings

## Blocked by

- Issue #1 — Project scaffold & database schema
