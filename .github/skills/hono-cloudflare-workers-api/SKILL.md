---
name: hono-cloudflare-workers-api
description: "Build or update Hono APIs in functions/api/**/*.ts for Cloudflare Pages Functions. Keep routes simple, validated, and edge-safe."
argument-hint: "What API change do you need in functions/api/**/*.ts?"
user-invocable: true
disable-model-invocation: false
---

# Hono Cloudflare Workers API

Simple workflow for implementing or updating Hono API endpoints in this repo.

## Scope

- Files: `functions/api/**/*.ts`
- Runtime: Cloudflare Pages Functions + Hono
- Goal: clear API contracts, minimal code, edge compatibility

## When to Use

- Add or change routes
- Add middleware (for example CORS/auth)
- Read/write Cloudflare bindings (for example KV)
- Improve validation or error handling

## Required Inputs

- Endpoint path and HTTP method(s)
- Request shape (params/query/body/headers)
- Response contract (success + error)
- Required bindings (for example KV)
- Security constraints (if any)

## Workflow

1. Locate and map current routes.
2. Confirm behavior and route contract.
3. Validate inputs before business logic.
4. Implement with Workers-compatible APIs only.
5. Access bindings from context and guard missing config.
6. Return consistent JSON with correct status codes.
7. Add middleware only where needed.
8. Test happy path and key failure paths.

## Quality Checks

- Route path/methods match request.
- Validation handles missing and malformed input.
- Status codes are semantically correct.
- Error payloads are consistent and non-leaky.
- Bindings are guarded.
- No Node-only APIs.
- Existing routes still work.

## Completion Criteria

- Requested endpoint behavior is implemented and tested locally.
- Code compiles with no new TypeScript errors.
- Responses are consistent with project conventions.
- Changes are minimal and isolated.

## Example Prompts

- Add a `GET /api/pages/:slug/views` route in `functions/api/[[route]].ts` that returns `{ views }`.
- Add request validation and consistent error payloads for `PUT /api/pages/:slug/views`.
- Add CORS middleware for only `/api/pages/*` in `functions/api/[[route]].ts`.
- Refactor Cloudflare KV access in `functions/api/[[route]].ts` to improve error handling.
