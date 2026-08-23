---
'@nnkogift/dhis2-form-utils-devtools': minor
---

Make `RulesPanel`'s scope filter strict and form-relative rather than mirroring the DHIS2 rule engine's own evaluation semantics. A rule with no `programStage` is now in scope only while the registration/enrollment slot is being viewed; a rule with a `programStage` is in scope only while that exact stage is being viewed. Previously a rule with no `programStage` was always considered in scope, everywhere, which didn't reflect "what's relevant to the form on screen." Out-of-scope enrollment rules now also show an "Applies to registration" caption, mirroring the existing "Applies to {{stage}}" caption for stage rules.
