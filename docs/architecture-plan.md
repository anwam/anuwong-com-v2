# Architecture improvements implementation plan and tracker

**Goal:** Fix the three architecture-review candidates in order, with independently verified tasks.
**Execution:** Inline on `fix/architecture-modules`; no deployment or publishing requested.
**Design:** Concentrate publication policy, like decisions, and theme lifecycle in their respective modules. Keep existing URLs, static rendering, HTTP response fields, and browser presentation. Add tests at the same interfaces callers use, plus generated-output and browser checks.
**Stack:** Installed Astro 6, TypeScript, Tailwind 4, Hono, Cloudflare KV, Node 24's test runner.

## Tracker

| Task                          | Status   | Completion evidence                                                                                                                                                         |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Published-post catalog     | Complete | 3 Node tests; production build (45 pages); five draft-only tags absent; RSS order, 12 homepage posts, all older/newer links checked.                                        |
| 2. Post-like decisions        | Complete | 12 request tests, 6 production-browser tests, and local Pages with real KV pass; rate limits, partial failures, stable identity, Thai IDs, retries, and navigation covered. |
| 3. Theme lifecycle            | Complete | 4 production-browser tests: saved dark/light before external scripts, swaps, live system fallback, blocked storage.                                                         |
| Final review and verification | Complete | Fresh review: both findings reproduced and fixed; 15 Node tests, 10 browser tests, production build, TypeScript, formatting, and diff checks pass.                          |

## Constraints and decisions

- Use the existing collection adapter; add no content repository abstraction.
- Preserve newest-first listings and RSS, the homepage's 12-post limit, and older/newer post navigation.
- Derive tag paths, counts, and listings from published posts only; preserve post IDs and existing URLs.
- Keep current like keys and visitor-header compatibility. Missing identity must not share a `null` visitor key.
- Surface persistence failures as errors; never set a success cookie for a failed operation. Keep KV's existing best-effort counting model explicit: this refactor cannot provide atomic multi-key writes or cross-request serialization.
- Count and duplicate state may partially persist. Use a durable visitor receipt to make retries converge; document and test recovery rather than claiming a transaction.
- Keep theme preference in the existing `theme` storage key and `dark` document class. Apply before first paint and after navigation, including blocked storage and system fallback.
- Do not migrate dependencies, change the visual design, or rewrite unrelated page-view storage behavior.

## Task 1: Published-post catalog

**Files:** `src/modules/blog/catalog.ts`, `src/modules/blog/getBlogCatalog.ts`, six content entry points in `src/pages/`, `tests/blog-catalog.test.ts`, `package.json`.

**Interface:** `createBlogCatalog(entries)` produces newest-first `posts`, published `tags` with their posts/counts, and chronological `navigation` with `post`, `prev`, and `next`; `getBlogCatalog()` supplies actual collection entries. Returned posts retain their original entry types and IDs.

- [x] Write failing tests for draft exclusion, draft-only tags, ordering, neighbours, empty input, and unchanged inputs.
- [x] Implement the catalog and replace selection policy in home, blogs, post routes, RSS, tag index, and tag routes.
- [x] Run Node tests and production build; inspect generated tag paths, RSS order, homepage limit, and navigation.
- [x] Record evidence in the tracker before starting Task 2.

## Task 2: Post-like decisions

**Files:** `src/modules/blog/postLikes.ts`, `functions/api/[[route]].ts`, `src/modules/blog/likes.ts`, `src/modules/blog/components/FloatingButton.astro`, request and browser tests.

**Interface:** A post-like module owns count parsing, storage keys, visitor validation, duplicate decisions, and failure outcomes; request handling maps outcomes to JSON/cookies. The browser module owns initialization, identity acquisition, request success validation, pending/liked/retry state, and stale-result invalidation.

- [x] Write failing request tests for first/repeated likes, missing identity, missing bindings, malformed stored counts, failed reads, and partial writes; retain existing view-route checks.
- [x] Implement bounded storage policy without generic CRUD adapters; preserve successful response fields and existing keys.
- [x] Write failing browser tests for request failures/retry, duplicate clicks, unavailable fingerprinting, navigation disposal, and stale initial reads.
- [x] Replace inline glue with bundled browser initialization; retain existing DOM hooks and make errors visible and retryable.
- [x] Run request/browser tests and local Pages verification; record actual limits of KV partial-failure recovery.

## Task 3: Theme lifecycle

**Files:** `src/modules/theme/theme.ts`, `src/layouts/BaseLayout.astro`, `src/components/ThemeToggle.astro`, theme browser tests.

**Interface:** One browser theme module owns initial application, persisted/system preference, navigation restoration, toggle delegation, and storage failure handling. Include the same implementation as an inline head script for first-paint application; avoid duplicate owners.

- [x] Write failing lifecycle tests for saved dark/light, invalid or unavailable storage, system changes, repeated swaps, and one toggle per click.
- [x] Implement one lifecycle owner and remove duplicated layout/button logic and commented legacy code.
- [x] Verify first-load and navigation behavior in a browser; run the full Node suite and production build.

## Review focus

- Draft-only tag paths must disappear from generated output, not just catalog fixtures (Task 1).
- Post navigation direction must survive the newest-first catalog (Task 1).
- Failed or partially persisted likes must not appear successfully liked in the browser (Task 2).
- Late network/fingerprint responses must not update a replaced post or undo a submitted like (Task 2).
- Blocked storage and repeated navigation must not break theme toggling (Task 3).

## Final verification

- [x] Review the complete change with fresh context; address material findings with regression tests.
- [x] Run all tests, production build, formatting on changed files, and `git diff --check`.
- [x] Leave task statuses and verification evidence current; report remaining operational limitations.

## Execution evidence and limitations

- Task 1: the catalog test file first failed because the module was missing; all three behavior tests then passed. Build output checked with HTML/XML parsing, including encoded Thai post IDs.
- Task 2: seven request regressions and three browser regressions failed before their respective fixes. Sequential retry recovers from failed pending-receipt, count, and completion writes. KV remains eventually consistent: concurrent requests can lose increments, and a stale receipt can still allow repeated work. No transactional or exactly-once claim.
- Task 2 local runtime: `npm run dev:pages` encountered an existing port conflict, so verification used `wrangler pages dev dist` on port 4337 with an isolated temporary persistence directory and both local KV bindings. Existing servers were left alone.
- Task 3: saved dark, live system fallback, and blocked-storage lifecycle tests failed before implementation; saved light already passed.
- Task 3 production verification: 8 browser tests pass across likes and theme. A blocked-storage error was traced to Astro's development toolbar, so the browser suite builds and tests production preview instead.
- Additional like regressions passed RED to GREEN: the maximum safe count remains readable/duplicated while further increments fail safely; Thai post IDs retain their storage keys and use encoded cookie names.
- Fresh review found two material issues, both reproduced before fixes: persisted fallback identity changed after reload when fingerprinting recovered; one invocation wrote the receipt key twice, violating Cloudflare KV's one-write/key/second limit. Saved fallback identity now takes precedence; intent and completion use separate keys and retries skip an already persisted count. Rate-limited request tests pass; final reload regression is included in the browser suite.
- Receipt protocol: `like-pending:<slug>:<visitor>` stores intended count once; existing `like:<slug>` and `liked:<slug>:<visitor>` keys keep their meanings. Completion writes `true` only after the aggregate write succeeds. Intent is retained for sequential retry recovery.
- KV constraints checked against [Cloudflare write documentation](https://developers.cloudflare.com/kv/api/write-key-value-pairs/). Cross-visitor bursts may still get retryable errors under the shared count key's one-write/second limit; exact concurrent counting requires a different persistence model.
- Final identity check also reproduced the inverse case (working fingerprint followed by unavailable fingerprint after reload). Both resolved fingerprints and generated fallback IDs are now persisted under the browser identity key.
- Final local Pages run with updated source passed for ASCII and Thai IDs: first/repeated likes, authoritative liked-state reads, success cookies, and missing-identity rejection.
- TypeScript check passed using the installed TypeScript 5.9.3 compiler with `--noEmit --ignoreDeprecations 5.0`; this override accommodates the repository's existing TypeScript 6 deprecation setting without changing project configuration.
- Final result: `npm test` 15/15; `npm run test:browser` 10/10 on a fresh production build; source TypeScript check, changed-file formatting, and `git diff --check` pass. All reviewed material findings are fixed; no deferred review findings.
