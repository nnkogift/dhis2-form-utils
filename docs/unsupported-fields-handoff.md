# Handoff: implement unsupported field widgets

**Status:** planning handoff (no implementation yet)  
**Base:** `main` after fine-tune field widgets (#23)  
**Related:** [`docs/use-field-control-plan.md`](./use-field-control-plan.md) §7 / open questions #2 and #4  
**Prior art:** multi-select / boolean radios / calendar pickers landed in #23 — mirror that delivery shape

---

## Goal

Replace `D2UnsupportedField` stubs for specialist DHIS2 `valueType`s with real widgets in all three UI adapters, with matching validation, Storybook coverage, and MSW-friendly tests.

Still stubbed today (all route to `D2UnsupportedField`):

| `valueType`         | `widgetKind`  | Notes                                       |
| ------------------- | ------------- | ------------------------------------------- |
| `COORDINATE`        | `coordinate`  | Also currently absorbs `GEOJSON`            |
| `GEOJSON`           | `coordinate`  | Likely wrong long-term — see open questions |
| `FILE_RESOURCE`     | `file`        | Needs upload → UUID                         |
| `IMAGE`             | `image`       | File upload + preview                       |
| `ORGANISATION_UNIT` | `orgUnit`     | OU uid string; tree/picker UI               |
| `REFERENCE`         | `unsupported` | **Stay unsupported** (no widget planned)    |

Storybook already has an `orgUnit` stub story (`STUB_WIDGET_KINDS`); `coordinate` / `file` / `image` are not in `TIER1` or stubs yet.

---

## Current wiring (do not reinvent)

```
FieldConfig.valueType
  → resolveWidgetKind()          // utils/hooks/src/fields/widgetKind.ts
  → useFieldControl().widgetKind
  → D2Field WIDGET_BY_KIND map   // components/{dhis2-ui,mantine,mui}/src/fields/D2Field.tsx
  → D2UnsupportedField           // disabled input + "Widget not yet implemented: …"
```

**Resolution already correct** for `COORDINATE` / `FILE_RESOURCE` / `IMAGE` / `ORGANISATION_UNIT`. Work is widgets + validation + stories — not new `WidgetKind` values (except possibly splitting `GEOJSON`).

**RHF contract (locked):** form values remain **flat strings**. Convert at the widget boundary only (same pattern as date/datetime Dayjs ↔ string).

**Package names (post-publish rename):** `@nnkogift/dhis2-form-utils-{hooks,metadata,dhis2-ui,mantine,mui,…}`.

**Peers:** `@dhis2/app-runtime` stays a peer — never bundle. Any org-unit tree or file upload that hits the API goes through `useDataQuery` / `useDataMutation`.

---

## Non-goals

- Do **not** invent a widget for `REFERENCE` — keep `unsupported`.
- Do **not** change enrollment system field ownership: tracker docs still say callers render `orgUnit` / `enrolledAt` / `occurredAt` themselves. This handoff is about **data-element / TEA** fields with `valueType: ORGANISATION_UNIT`, which may reuse the same picker component but are registered under the DE/TEA uid, not the literal key `'orgUnit'`.
- Do **not** rework event `buildSchema` coercion; per-field string validation lives in `buildFieldSchema` / `buildTeaFieldSchema`.
- Do **not** change select / multiSelect / boolean / date behavior from #23.

---

## Recommended delivery order

Ship in vertical slices (hooks validation → three adapters → Storybook), easiest → hardest:

1. **`coordinate`** — pure UI + string parse/join; no network
2. **`orgUnit`** — needs hierarchy data (API or injected props)
3. **`file`** then **`image`** — upload lifecycle + UUID storage (+ preview for image)

`REFERENCE` / generic `unsupported` remain the fallback.

---

## 1. Coordinate

### Value shape (decision required)

Open question #2 in the field-control plan is still open. **Default recommendation for this handoff:**

| Layer           | Format                                                                |
| --------------- | --------------------------------------------------------------------- |
| DHIS2 API / RHF | JSON array string **`[longitude,latitude]`** e.g. `"[35.703,-5.639]"` |
| Widget UI       | Two numeric inputs (lng + lat) or a single map picker later           |

Rationale: Capture / Tracker and community docs use `[lng,lat]` with brackets (GeoJSON order), not `"lat,lng"`. The older plan table saying `"lat,lng"` should be treated as outdated unless product explicitly overrides.

Helpers (new small module, e.g. `utils/hooks/src/fields/coordinateValue.ts`, re-export from hooks):

```ts
parseCoordinateValue(value: string): { lng: number; lat: number } | null
joinCoordinateValue(lng: number, lat: number): string // "[lng,lat]"
```

Validate ranges: lng ∈ [-180, 180], lat ∈ [-90, 90]. Empty `''` allowed when optional.

### Validation

- Extend `buildFieldSchema` and `buildTeaFieldSchema` with a refine/regex for the `[lng,lat]` string (today both fall through to `z.string()`).
- Event `buildSchema` already treats `COORDINATE` as a plain string — keep that; do not switch to object shapes.

### Adapter mapping

| Adapter  | Suggested UI                                          |
| -------- | ----------------------------------------------------- |
| dhis2-ui | Two `InputField type="number"` (Longitude / Latitude) |
| mantine  | Two `NumberInput`                                     |
| mui      | Two `TextField type="number"`                         |

Wire `case 'coordinate'` in each `WIDGET_BY_KIND` away from `D2UnsupportedField`.

### GEOJSON

Today `GEOJSON` maps to `coordinate`. That is wrong for full GeoJSON Feature/Geometry blobs. Options:

- **A (preferred for v1):** keep mapping for points-only programs; document limitation.
- **B:** introduce `widgetKind: 'geojson'` → unsupported / textarea until a real editor exists.
- **C:** detect point-only GeoJSON and reuse coordinate UI.

**Decide before merging** so Storybook and validation do not lie.

---

## 2. Organisation unit

### Value shape

RHF string = **organisation unit uid** (11-char DHIS2 id). Align with:

- `packages/metadata/src/buildSchema.ts` → `z.string().min(11).max(11)`
- `buildTeaFieldSchema` already has the same rule for `ORGANISATION_UNIT`
- Tracker enrollment `orgUnit` system field uses the same uid rule

Add the same refine to `buildFieldSchema` (currently missing — falls through to `z.string()`).

### Data fetching (decision required)

Open question #4: should the widget fetch, or should the host inject?

| Approach                            | Pros                                                                                                                   | Cons                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Widget-owned `useDataQuery`**     | Plug-and-play `D2Field`                                                                                                | Couples adapters to app-runtime; Storybook needs MSW; harder offline |
| **Injected tree / roots via props** | Testable; host controls scope (user OUs, program OUs)                                                                  | Breaks pure `D2Field({ field })` unless context/provider exists      |
| **Hybrid (recommended)**            | `OrgUnitPickerProvider` (optional context) + widget falls back to a default `organisationUnits` query when no provider | Matches “works in Storybook with MSW” and “apps can scope the tree”  |

Recommended public shape:

```ts
type OrgUnitPickerContextValue = {
    roots?: string[]; // root OU ids
    // or a preloaded tree; keep minimal for v1
};

// Optional React context in hooks or each adapter
```

dhis2-ui already exports `OrganisationUnitTree` from `@dhis2/ui` (there is **no** high-level `OrgUnitField` export in `@dhis2/ui` ≥9 — compose tree + selected display yourself).

### Adapter mapping

| Adapter  | Suggested UI                                               |
| -------- | ---------------------------------------------------------- |
| dhis2-ui | `OrganisationUnitTree` + selected OU label / clear         |
| mantine  | Tree or searchable select backed by the same OU list/query |
| mui      | TreeView / Autocomplete over OUs                           |

Empty selection → `''`. Disabled when `control.isDisabled`. Respect `isMandatory` / validation via `resolveFieldValidation`.

### Distinction vs enrollment `orgUnit`

| Concern  | Field widget (`ORGANISATION_UNIT` DE/TEA) | Enrollment system field |
| -------- | ----------------------------------------- | ----------------------- |
| Form key | DE/TEA uid                                | literal `'orgUnit'`     |
| Renderer | `D2Field` / `widgetKind: 'orgUnit'`       | Caller-owned (docs)     |
| Value    | OU uid string                             | OU uid string           |

Share a presentational picker if useful; do not force enrollment through `D2Field` in this workstream unless product asks.

---

## 3. File & image

### Value shape

RHF string = **file resource UUID** after successful upload (matches `buildSchema` `UUID_SCHEMA` for `FILE_RESOURCE` / `IMAGE`). While uploading, keep previous value or `''`; surface upload errors in the widget (and optionally RHF `setError`).

### Upload lifecycle

1. User picks a `File` via the design-system file control.
2. Widget `POST`s multipart to DHIS2 `fileResources` (via `useDataMutation` / app-runtime).
3. On success, `field.onChange(response.fileResource.id)` (confirm exact response path against current API).
4. Optional: `GET fileResources/{id}` or `/api/fileResources/{id}/data` for name / image preview.
5. Clear → `field.onChange('')` (and optionally delete remote resource — **out of scope for v1** unless required).

**Do not** store raw `File` objects in RHF. Persist only the UUID string so `filterPayload` / tracker payloads stay serializable.

### Validation

- `buildFieldSchema` / `buildTeaFieldSchema`: UUID string when non-empty (mirror event schema).
- Image: optionally tighten `accept` to image MIME types in the widget only.

### Adapter mapping

| Adapter  | File                                             | Image                              |
| -------- | ------------------------------------------------ | ---------------------------------- |
| dhis2-ui | `FileInputField` (+ `FileList` / `FileListItem`) | Same + `<img>` / thumbnail preview |
| mantine  | `FileInput`                                      | `FileInput` + preview              |
| mui      | hidden `<input type="file">` + `Button` / chips  | Same + preview                     |

Peers: adapters that call app-runtime need `@dhis2/app-runtime` as a **peer** (already true for hooks hosts; declare on UI packages if widgets import it directly). Prefer a tiny shared upload helper in hooks (e.g. `useFileResourceUpload`) so mantine/mui/dhis2-ui do not fork mutation logic.

### Storybook / MSW

- Mock `POST /api/fileResources` → `{ response: { fileResource: { id: '<uuid>', … } } }`.
- Mock download/preview URL for image stories.
- Interaction tests: pick file → assert UUID appears in form state / accessible name; stub stories must leave `STUB_WIDGET_KINDS`.

---

## 4. Cross-cutting implementation checklist

### Hooks / metadata

- [ ] `coordinateValue` parse/join helpers + unit tests
- [ ] `buildFieldSchema` cases: `COORDINATE`, `ORGANISATION_UNIT`, `FILE_RESOURCE`, `IMAGE`
- [ ] Align `buildTeaFieldSchema` (OU already present; add the rest)
- [ ] Decide `GEOJSON` mapping; adjust `widgetKind.ts` + tests
- [ ] Optional: `useFileResourceUpload`, org-unit picker context types exported from hooks

### UI adapters (each of dhis2-ui / mantine / mui)

- [ ] `D2CoordinateField`, `D2OrgUnitField`, `D2FileField`, `D2ImageField`
- [ ] Export from `widgets/index.ts`
- [ ] Point `WIDGET_BY_KIND` entries away from `D2UnsupportedField`
- [ ] Keep `unsupported` → `D2UnsupportedField`
- [ ] `fallow-ignore-next-line` **kinds only** (no prose after `--` — that creates fake stale kinds)
- [ ] Prefer file-level `// fallow-ignore-file code-duplication` on mirrored `D2Field.tsx` if clone groups fire

### Storybook

- [ ] Expand `TIER1_WIDGET_KINDS` / stubs in `apps/storybook/fixtures/fieldMetadata.ts`
- [ ] Stories: `Coordinate`, `OrgUnit`, `File`, `Image` per adapter
- [ ] Interactions in `fieldStoryInteractions.ts` (picker-friendly queries; avoid brittle `input[type=…]` only)
- [ ] MSW handlers for OU tree + fileResources
- [ ] Remove `orgUnit` from `STUB_WIDGET_KINDS` once interactive

### Docs

- [ ] Update valueType → widget table in `docs/use-field-control-plan.md` §7 with real components + `[lng,lat]`
- [ ] Close open questions #2 and #4 (or record decisions here and link)
- [ ] Touch `apps/docs` reference pages (`reference/dhis2-ui`, `mantine`, `mui`, `hooks`) when widgets ship
- [ ] Tracker how-to: clarify DE/TEA `ORGANISATION_UNIT` vs enrollment `orgUnit`

### Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test                 # unit
pnpm test:storybook       # browser interactions
pnpm exec fallow audit --format json --quiet --explain   # verdict must pass before commit/push
```

Branch naming: `feature/…` or `cursor/<name>-df51` in cloud. Commits: Conventional Commits (`feat:`, `fix:`, `docs:`).

---

## Suggested file layout

```
utils/hooks/src/fields/
  coordinateValue.ts
  coordinateValue.test.ts
  useFileResourceUpload.ts          # optional shared upload hook
  orgUnitPickerContext.ts           # optional context
  fieldValidation.ts                # extend
  widgetKind.ts                     # GEOJSON decision only

components/{dhis2-ui,mantine,mui}/src/fields/widgets/
  CoordinateField.tsx
  OrgUnitField.tsx
  FileFields.tsx                    # file + image, or split
  index.ts                          # exports
  D2Field.tsx                       # WIDGET_BY_KIND updates

apps/storybook/
  fixtures/fieldMetadata.ts
  .storybook/msw-handlers.ts        # OU + fileResources
  stories/*/D2Field.stories.tsx
  interactions/fieldStoryInteractions.ts
```

---

## Open decisions (resolve before coding each slice)

| #   | Decision                       | Recommendation                                                                   |
| --- | ------------------------------ | -------------------------------------------------------------------------------- |
| C1  | Coordinate wire format         | `[lng,lat]` JSON string                                                          |
| C2  | GEOJSON vs coordinate          | Keep point alias for v1 **or** split to unsupported `geojson`                    |
| O1  | Org-unit data source           | Hybrid: optional provider + default query                                        |
| O2  | Single-select only vs multi OU | Single uid string for v1 (matches valueType)                                     |
| F1  | Upload API helper location     | Shared hook in `hooks` package                                                   |
| F2  | Delete remote file on clear    | Skip in v1                                                                       |
| F3  | Max file size / MIME           | Widget `accept` + server errors; no hard-coded size unless Capture parity needed |

---

## Acceptance criteria

- Selecting/clearing each new widget updates the RHF string value in the documented format.
- Hidden/disabled/mandatory/rule validation still flow through `useFieldControl` + `resolveFieldValidation`.
- `REFERENCE` and unknown types still show the unsupported stub.
- Storybook interactions pass for the new stories on all three adapters.
- Unit tests cover parse/join + schema rejects for bad coordinates / non-uid OU / non-uuid files.
- `fallow audit` new-only gate passes.
- No new peer is silently bundled; app-runtime usage is peer-declared where imported.

---

## Implementation agent prompt (copy/paste)

```text
Implement unsupported field widgets per docs/unsupported-fields-handoff.md.

Slice order: coordinate → orgUnit → file → image.
Keep RHF values as strings; REFERENCE stays unsupported.
Follow #23 patterns (WIDGET_BY_KIND, resolveFieldValidation, Storybook + MSW).
Resolve open decisions C1/C2/O1 in the PR description before merging widgets.
Do not edit the handoff file except to check off completed checklist items or record decisions.
```
