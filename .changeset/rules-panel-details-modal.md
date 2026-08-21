---
'@nnkogift/dhis2-form-utils-devtools': minor
---

Add a read-only rule details modal to the Rules panel, opened from an info button on each rule card. It lazily fetches the full `programRules/{id}` resource when opened (showing a loading spinner) — code, description, program, stage, priority, last-updated info, the raw condition with typed variable chips resolved against `programRuleVariables`, and every action's target/expression/content — so the catalog list query stays lightweight. Requires `@dhis2/app-runtime` as a peer dependency.
