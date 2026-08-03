# Backend & API Standards

## Runtime

- **Bun** for all non-Next.js backend services and scripts.
- TypeScript everywhere — no plain JS backend code.

## API Design

- REST for CRUD resources. Keep URLs flat and noun-based.
- Consistent error shape across all endpoints:

```ts
type ApiError = {
    error: string; // human-readable message
    code: string; // machine-readable code, e.g. "VALIDATION_ERROR"
    details?: unknown; // optional field-level errors from Zod
};
```

- All request bodies validated with Zod before any business logic runs. Return 400 with the `ApiError` shape on validation failure — never let unvalidated data reach handlers.
- HTTP status codes used correctly: 200/201 for success, 400 for client errors, 401/403 for auth, 404 for not found, 422 for validation, 500 for server errors.

## Project Structure (Node/Bun services)

```
src/
  routes/          ← route handlers, thin — delegate to services
  services/        ← business logic
  repositories/    ← database access (Prisma calls go here)
  schemas/         ← Zod schemas and inferred types
  proxy/      ← auth, error handling, logging
  utils/           ← domain-specific helpers
  types/           ← shared TypeScript types
  config.ts        ← env variable parsing and validation
```

## Environment Variables

- All env vars parsed and validated at startup using Zod.
- Never access `process.env.SOMETHING` directly in business logic — import from `config.ts`.
- `.env.example` always kept up to date. `.env` never committed.

```ts
// config.ts
import { z } from 'zod';

const schema = z.object({
    DATABASE_URL: z.string().url(),
    DHIS2_BASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
});

export const config = schema.parse(process.env);
```

## Queue / Workers (RabbitMQ / BullMQ)

- Workers are isolated — one worker file per queue/job type.
- Jobs must be idempotent where possible.
- Failed jobs log full context (job ID, payload shape, error) before rethrowing.
- Dead-letter queues configured for all production queues.

## Error Handling

- Never swallow errors silently (`catch (e) {}`).
- Always log the error with context before handling or rethrowing.
- Distinguish between operational errors (expected, handleable) and programmer errors (bugs, should crash).
- Use a centralised error handler in Express/Hono proxy — don't handle HTTP error responses inside individual route handlers.
