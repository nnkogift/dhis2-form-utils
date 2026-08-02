repo: nnkogift/dhis2-form-utils
branch: main
path: utils/devtools

## Last sync
date: 2026-07-31T12:30:00Z

### Updated in this project
- Read the devtools rule panels (ProgramRulesPanel, RuleDevtoolsPanel, TraceTimeline, EffectBadge, effectStyles) as the ground truth for the playground's rule rails.
- Lifted the exact effect-variant colours, icons and short labels from `effectStyles.ts` (plus purple-100/900 from `packages/config/tailwind-theme.css`).
- Read `components/dhis2-ui` D2Field / FormSection / FormFeedback to reproduce field and section rendering.

## Screen map
| Screen | Built from |
| --- | --- |
| Program list (today) | playground/src/pages/ProgramListPage.tsx, components/programs/ProgramListTable.tsx, ProgramListFilters.tsx |
| Tracker rules page (today) | playground/src/pages/ProgramPlaceholderPage.tsx, forms/ProgramRegistrationForm.tsx, RegistrationFormFields.tsx, TrackerSystemFields.tsx, FormSectionCard.tsx |
| Event rules page (today) | playground/src/components/programs/forms/ProgramEventForm.tsx, EventFormFields.tsx, EventSystemFields.tsx |
| Rule rails (both) | utils/devtools/src/ProgramRulesPanel.tsx, RuleDevtoolsPanel.tsx, TraceTimeline.tsx, EffectBadge.tsx, effectStyles.ts |
