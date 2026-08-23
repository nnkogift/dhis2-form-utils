---
'@nnkogift/dhis2-form-utils-devtools': minor
---

Code-split the Graph tab (`@xyflow/react`) behind `React.lazy`, switch the package to `preserveModules`, and add `./effect-styles` and `./scope` subpath exports so badge helpers and the scope wrapper no longer pull the graph stack.
