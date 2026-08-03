# DHIS2 Reference

Load this file when working on DHIS2 apps, DHIS2 integrations, or anything involving the DHIS2 API. It supplements the main coding-standards SKILL.md.

---

## App Structure (DHIS2 Web Apps)

App structure is bootstrapped by the DHIS2 app platform — do not hand-roll it.
See the full skill: https://www.skills.sh/devotta-labs/dhis2-app-skills/dhis2-app-development

Follow that skill for directory layout, tooling setup, and DHIS2 CLI usage.
Module organisation inside `src/` follows the **modules/** convention from coding-standards (not Next.js `_shared`).

---

## API Conventions

- Always use the versioned API path: `/api/40/` — never rely on unversioned `/api/`
- Use field filtering aggressively: `?fields=id,displayName,code` — never fetch full objects when partial suffices
- Paging: always handle `pager` in list responses; never assume all results fit in one page
- Use `rootJunction=AND` and `filter=` params for server-side filtering over client-side filtering on large datasets

---

## Data Store

- Namespace all data store keys under a consistent app namespace: `<appName>:<key>`
- Data store is not a database — do not store large or frequently updated datasets there
- Always check for namespace existence before reading; handle 404 gracefully on first run
- Type all data store payloads with Zod schemas and validate on read

```ts
// Pattern for data store reads
const raw = await dataStoreClient.get<unknown>(namespace, key);
const parsed = mySchema.safeParse(raw);
if (!parsed.success) {
    // handle migration or corruption gracefully
}
```

---

## DHIS2 UI Library

- Use `@dhis2/ui` components for all UI in DHIS2 apps — do not introduce a second component library
- Follow DHIS2 design system spacing and color tokens — no custom CSS that overrides core tokens
- Use `@dhis2/app-runtime` for data queries and mutations inside DHIS2 apps:
    ```ts
    const { data, loading, error } = useDataQuery(query);
    ```
- `useDataMutation` for all create/update/delete operations through the app runtime

---

## CAPS / Climate Integration

- ERA5 and CHIRPS data ingestion always goes through the pipeline engine — no ad-hoc fetches in the app
- CHAP prediction results are written back to DHIS2 as data values via the data value set API
- All pipeline steps are idempotent — running the same step twice must produce the same result
- Use DHIS2 organisation unit codes (not UIDs) as the primary key when joining climate data to DHIS2 data, since UIDs are instance-specific

---

## Auth & Context

- Never hardcode DHIS2 base URLs — always read from `DHIS2_BASE_URL` env or the app runtime context
- Use the `@dhis2/app-runtime` `useConfig()` hook to access the server URL and API version at runtime
- For standalone integrations (not inside DHIS2 app shell), use PAT tokens via environment variables
