---
'@nnkogift/dhis2-form-utils-devtools': minor
---

The read-only rule details modal footer now links to the actual program rule editor instead of just naming it. It resolves to the Maintenance app on DHIS2 v42 and below, or the Metadata Management app on v43+, based on the connected server's version via `useConfig`.
