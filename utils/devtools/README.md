# @nnkogift/dhis2-form-utils-devtools

Developer tools for debugging DHIS2 program rules in dhis2-form-utils forms.

> Part of [dhis2-form-utils](https://github.com/nnkogift/dhis2-form-utils#readme). This package is in alpha — APIs may change between releases.

> **Development only.** Do not include this package in production form bundles.

## Install

```bash
pnpm add -D @nnkogift/dhis2-form-utils-devtools
```

Peer dependencies: `react`, `react-dom`, `@dhis2/app-runtime`, `@dhis2/ui`, `@dhis2/d2-i18n`.

## Usage

```tsx
import '@nnkogift/dhis2-form-utils-devtools/style.css';
import { RulesPanel } from '@nnkogift/dhis2-form-utils-devtools';
import { RuleDevtoolsScope } from '@nnkogift/dhis2-form-utils-devtools/scope';

<FormStateProvider formStore={formStore} form={form}>
    <RuleDevtoolsScope formStore={formStore}>
        {/* form fields */}
        <RulesPanel metadata={{ formKind: 'event', metadata: program, programStageId }} />
    </RuleDevtoolsScope>
</FormStateProvider>;
```

`RulesPanel` has three tabs: **Rules** (every program rule and its state), **Trace** (evaluation log) and **Graph** (rule dependency graph).

## Documentation

Full documentation lives in the [dhis2-form-utils repository](https://github.com/nnkogift/dhis2-form-utils#readme) and its [docs folder](https://github.com/nnkogift/dhis2-form-utils/tree/main/docs).

## License

MIT
