---
'@nnkogift/dhis2-form-utils-rules': patch
---

Read the event status for `V{event_status}` from `currentValues.status` (`ACTIVE`, `COMPLETED`, `SCHEDULE`, `SKIPPED`, `VISITED` or `OVERDUE`) instead of hard-coding `ACTIVE`. Missing or unrecognised values still fall back to `ACTIVE`. Callers must keep `status` out of submitted data values.
