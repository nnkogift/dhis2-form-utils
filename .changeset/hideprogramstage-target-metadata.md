---
'@nnkogift/dhis2-form-utils-metadata': patch
'@nnkogift/dhis2-form-utils-rules': patch
---

Fetch and pass through the `programStage` target for `HIDEPROGRAMSTAGE` program rule actions. Previously `PROGRAM_RULE_ACTION_FIELDS` never requested this field and `toActionValues` never read it, so `HIDEPROGRAMSTAGE` actions reached `@dhis2/rule-engine` with no target regardless of whether the rule's condition matched.
