---
'@nnkogift/dhis2-form-utils-metadata': minor
'@nnkogift/dhis2-form-utils-hooks': minor
---

Field schemas are now derived from the full field configuration through one shared `buildFieldSchema` used by `buildSchema` and `buildTrackerSchema`. It enforces `compulsory` / `mandatory` (not for `generated` TEAs), `allowFutureDate`, option-set codes and numeric `renderType` bounds (`min`, `max`, `decimalPoints`).

Behaviour change: form inputs stay strings, but the schema output is now typed (numbers, booleans, strings; `undefined` when empty) instead of using `z.coerce`. Use the new `toPayloadValues` to serialize parsed values back to the strings DHIS2 expects. `buildFieldSchema` in the hooks package is now a thin adapter over the metadata one.

Schema error messages are now human-friendly (for example "Enter a valid number" instead of "Expected number, received nan") and translated at validation time via `@dhis2/d2-i18n`, which becomes a peer dependency of `@nnkogift/dhis2-form-utils-metadata`.
