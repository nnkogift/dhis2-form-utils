---
'@nnkogift/dhis2-form-utils-rules': patch
---

Read the enrollment status for `V{enrollment_status}` from `currentValues.status` (`ACTIVE`, `COMPLETED` or `CANCELLED`) instead of hard-coding `ACTIVE`. Missing or unrecognised values still fall back to `ACTIVE`. This applies to both the registration engine and event forms that receive an `enrollment`. Callers must keep `status` out of submitted attribute values.
