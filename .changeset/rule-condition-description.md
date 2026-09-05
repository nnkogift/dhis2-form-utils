---
'@nnkogift/dhis2-form-utils-devtools': minor
---

Rule details modal now shows a human-readable reading of the condition expression, fetched from the same DHIS2 `programRules/condition/description` endpoint the Maintenance app uses, rather than reimplementing expression parsing client-side. Renders between the raw condition and the existing "Variables referenced" chips, with loading and malformed-expression states.
