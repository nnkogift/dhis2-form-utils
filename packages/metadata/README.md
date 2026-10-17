# @nnkogift/dhis2-form-utils-metadata

Convert DHIS2 metadata into Zod schemas for React Hook Form, plus DHIS2 queries and resolvers for program metadata.

> Part of [dhis2-form-utils](https://github.com/nnkogift/dhis2-form-utils#readme). This package is in alpha — APIs may change between releases.

## Install

```bash
pnpm add @nnkogift/dhis2-form-utils-metadata zod
```

## Usage

```ts
import { buildSchema, buildTrackerSchema } from '@nnkogift/dhis2-form-utils-metadata';

// Program stage event form, keyed by data element uid
const eventSchema = buildSchema(stageMetadata);

// Tracker registration form (TEAs, orgUnit, enrolledAt, ...)
const trackerSchema = buildTrackerSchema(trackerMetadata);
```

Fetch metadata with `eventProgramConfigQuery` / `trackerConfigQuery` and resolve it with `resolveEventProgramMetadata` / `resolveTrackerProgramMetadata`. Pass the resulting schema to `useForm` via `@hookform/resolvers/zod`, or let `@nnkogift/dhis2-form-utils-hooks` do it for you.

## Documentation

Full documentation lives in the [dhis2-form-utils repository](https://github.com/nnkogift/dhis2-form-utils#readme) and its [docs folder](https://github.com/nnkogift/dhis2-form-utils/tree/main/docs).

## License

MIT
