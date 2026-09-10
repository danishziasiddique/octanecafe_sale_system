# octanecafe

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

## Commands

| Task             | Command              |
| ---------------- | -------------------- |
| Dev server       | `npm run dev`        |
| Production build | `npm run build`      |
| Lint             | `npm run lint`       |
| Typecheck        | `npm run typecheck`  |
| Tests (once)     | `npm test`           |
| Tests (watch)    | `npm run test:watch` |
| Format           | `npm run format`     |

Before calling any change done, `npm run typecheck && npm run lint && npm test` must all pass.

## Layout

```
src/
  app/         App Router routes, layouts, and route handlers
  components/  Reusable React components (one component per file)
```

Path alias: `@/*` maps to `src/*`. Use it instead of `../../` chains.

## Conventions

- **Server Components by default.** Add `'use client'` only when a component needs
  state, effects, or browser APIs, and push it as far down the tree as possible.
- **Styling is Tailwind utilities.** Tailwind v4 is configured through
  `postcss.config.mjs` and `src/app/globals.css` — there is no `tailwind.config.js`.
  Theme tokens go in the `@theme` block in `globals.css`.
- **Components are typed with an explicit props type**, not inline annotations.
  Default-export the component; name the props type `<Name>Props`.
- **Tests live beside their subject** as `Foo.test.tsx`, using Vitest plus React
  Testing Library. Query by role or visible text, not by test IDs or class names.
- **Formatting is Prettier's job** (no semicolons, single quotes, 100 columns).
  Don't hand-tune whitespace; run `npm run format`.

## Notes

- `node_modules` lives inside this folder, so it is large and must stay gitignored.
- Tailwind class ordering is enforced by `prettier-plugin-tailwindcss`, so class
  strings may get reordered on format. That is expected.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
