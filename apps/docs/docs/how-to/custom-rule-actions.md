# Handle custom rule actions with `effectHandlers`

Some DHIS2 implementations reuse standard program rule action types — most often `DISPLAYTEXT` or
`ASSIGN` — in non-standard ways: encoding machine-readable instructions for a custom widget, for
example, rather than plain display text. `effectHandlers` is the extension point for that.

## Pass `effectHandlers` to the form hook

```tsx
const { form, formStore } = useEventForm({
    options: {
        programStageId,
        metadata,
        effectHandlers: {
            SENDMESSAGE: (effect) => {
                // custom side-effect handling — e.g. show a toast
                console.log('Program notification triggered by rule', effect.ruleId);
            },
        },
    },
});
```

Handlers run **after** the standard evaluation pass, for every effect whose action type has a
handler registered. `effectHandlers` is captured in a ref internally — pass a stable reference
(module-level object, or memoized) to avoid unnecessary re-subscription churn.

## What effects reach a handler

Every effect the rule engine produces reaches `effectHandlers` if there's a handler registered
for its action type — including action types the store doesn't otherwise model into field,
section, or feedback state:

- `SENDMESSAGE` / `SCHEDULEMESSAGE` — server-side notification triggers with no client-rendered
  state of their own
- `HIDEPROGRAMSTAGE` — stage-level visibility, out of scope for a single-stage `useEventForm` call
- Any standard action type (`HIDEFIELD`, `ASSIGN`, `DISPLAYTEXT`, …) — a handler here runs
  _alongside_ the standard mapping into `FieldStateMap`/`SectionStateMap`/`FeedbackMap`, not
  instead of it

## Example: a custom `DISPLAYTEXT` convention

Suppose a program configures `DISPLAYTEXT` rules whose `content` is a JSON string your app
interprets as instructions for a custom widget, rather than plain text to display:

```tsx
const { form, formStore } = useEventForm({
    options: {
        programStageId,
        metadata,
        effectHandlers: {
            DISPLAYTEXT: (effect) => {
                try {
                    const instruction = JSON.parse(effect.data ?? '{}');
                    myWidgetBus.dispatch(instruction);
                } catch {
                    // not one of ours — fall through to normal feedback rendering
                }
            },
        },
    },
});
```

If you need extra metadata fields to interpret a rule action (for example
`programRuleActions[displayContent]`), extend the query object rather than the handler — see
`withExtraFields` in the [metadata reference](../reference/metadata.md#extending-queries).

See [`evaluateAndMap`](../reference/rules.md#evaluateandmap) in the rules reference for the exact
signature `effectHandlers` conforms to.
