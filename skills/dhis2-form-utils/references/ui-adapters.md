# UI adapters — `dhis2-ui`, `mantine`, `mui`

Three drop-in UI adapters render fields for whichever design system the host app already
uses. All three sit at the **top** of the layer stack (UI adapters → hooks → rules/metadata
→ peers) and never talk to `@dhis2/app-runtime` or the rule engine directly — they only
consume `useFieldControl` from `@dhis2-form-utils/hooks`.

## Identical surface across all three (verified against each package's `src/index.ts`)

```ts
export { D2Field } from '...';
export type { D2FieldProps } from '...';
export type { WidgetProps, FieldControlReturn } from '@dhis2-form-utils/hooks'; // re-exported
export { FormSection } from '...';
export type { FormSectionProps } from '...';
export { FormFeedback } from '...';
```

`@dhis2-form-utils/dhis2-ui` additionally exports `D2FieldWidget` (+ `D2FieldWidgetProps`) —
not present in `mantine` or `mui`.

## Choosing an adapter

Match whatever the host app's design system already is:

| Package                      | Import                                                 | Design system                                     |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| `@dhis2-form-utils/dhis2-ui` | `import { D2Field } from '@dhis2-form-utils/dhis2-ui'` | `@dhis2/ui` — default for DHIS2 App Platform apps |
| `@dhis2-form-utils/mantine`  | `import { D2Field } from '@dhis2-form-utils/mantine'`  | Mantine                                           |
| `@dhis2-form-utils/mui`      | `import { D2Field } from '@dhis2-form-utils/mui'`      | Material UI                                       |

Only one is needed per app — don't mix adapters in the same form tree.

## `D2Field`

```tsx
<D2Field field={{ kind: 'dataElement', config: psde }} />
```

Internally calls `useFieldControl`, which merges DHIS2 field metadata (the
`ProgramStageDataElement`/`ProgramTrackedEntityAttribute` config), React Hook Form state,
and per-field rule-engine state (from `useFieldState`) into a single `FieldControlReturn`
contract, then picks a widget by `valueType` (see `docs/use-field-control-plan.md` for the
full mapping table).

## Writing a custom field component

Skip `D2Field` and call `useFieldControl` directly when you need full control over markup:

```tsx
import { useFieldControl } from '@dhis2-form-utils/hooks';

function CustomField({ psde }) {
    const control = useFieldControl({ kind: 'dataElement', config: psde });
    if (control.isHidden) return null;
    // render your own input using control.field (RHF field props),
    // control.isMandatory, control.error/control.warning, etc.
}
```

Always requires `FormStateProvider` (from `@dhis2-form-utils/hooks`) in the tree — see
`event-forms.md`/`tracker-forms.md` for the required provider wiring.

## `FormSection` / `FormFeedback`

- `FormSection` renders a collapsible/visible section that respects `HIDESECTION` via
  `useSectionState` internally.
- `FormFeedback` renders `DISPLAYTEXT`/`DISPLAYKEYVALUEPAIR` and warning/error feedback via
  `useFormFeedback` internally.

Both require the same `FormStateProvider` as `D2Field`.
