---
'@nnkogift/dhis2-form-utils-devtools': minor
---

`RulesPanel`'s Rules tab gains an "In scope" / "All" segmented control that filters (or, in "All", dims and labels) rules against the form currently on screen, plus a new optional `activeProgramStageId` prop so a host app can tell the panel which slot is visible when that isn't implied by the `metadata` prop alone (e.g. a tracker/registration context navigating between stages).

Scope is strict and form-relative, not a mirror of how the DHIS2 rule engine itself evaluates rules: a rule with no `programStage` is in scope only while the registration/enrollment slot is being viewed, and a rule with a `programStage` is in scope only while that exact stage is being viewed — never both, never everywhere. Out-of-scope cards show an "Applies to registration" or "Applies to {{stage}}" caption depending on which side of that split they're on.
