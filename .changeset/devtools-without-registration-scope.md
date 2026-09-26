---
'@nnkogift/dhis2-form-utils-devtools': patch
---

Disable stage-based program-rule scope filtering for event programs with `programType === 'WITHOUT_REGISTRATION'`. All rules are shown as in scope and the In scope / All control is hidden, since single-stage programs often store rules without a `programStage`.
