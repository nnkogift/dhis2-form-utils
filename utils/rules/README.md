# @nnkogift/dhis2-form-utils-rules

DHIS2 program rule evaluation and field state mapping for React forms. Wraps `@dhis2/rule-engine` rather than reimplementing it.

> Part of [dhis2-form-utils](https://github.com/nnkogift/dhis2-form-utils#readme). This package is in alpha — APIs may change between releases.

## Install

```bash
pnpm add @nnkogift/dhis2-form-utils-rules @dhis2/rule-engine
```

`@dhis2/rule-engine` is a peer dependency and is never bundled.

## Usage

```ts
import { evaluateAndMap, filterPayload } from '@nnkogift/dhis2-form-utils-rules';

// Run the engine against current form values and fold the effects into a field state map
const fieldState = evaluateAndMap(engine, values);

// Strip rule-hidden fields and apply ASSIGN values before submitting
const payload = filterPayload(values, fieldState);
```

Most apps use this package through `@nnkogift/dhis2-form-utils-hooks`, which runs the evaluation reactively.

## Documentation

Full documentation lives in the [dhis2-form-utils repository](https://github.com/nnkogift/dhis2-form-utils#readme) and its [docs folder](https://github.com/nnkogift/dhis2-form-utils/tree/main/docs).

## License

MIT
