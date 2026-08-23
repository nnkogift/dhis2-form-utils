---
'@nnkogift/dhis2-form-utils-devtools': patch
---

Fix `RulesPanel`'s "In scope" / "All" filter for tracker registration forms: stage-scoped rules were always reported out of scope because the panel had no way to know which program stage was currently visible in the host app. Add an optional `activeProgramStageId` prop so consuming apps can pass the currently visible stage (or `null` for the registration view) and get correct scope filtering.
