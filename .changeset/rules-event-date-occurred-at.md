---
'@nnkogift/dhis2-form-utils-rules': patch
---

Resolve `V{event_date}` from `occurredAt` when `eventDate` is absent, so event forms that follow tracker API field naming no longer evaluate the event date as null.
