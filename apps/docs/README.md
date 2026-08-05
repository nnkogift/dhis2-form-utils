# dhis2-form-utils docs

The public documentation site, built with [Docusaurus](https://docusaurus.io/). Deployed to
GitHub Pages alongside the built Storybook — see `.github/workflows/deploy-docs.yml`.

## Local development

```bash
pnpm docs
```

Starts a local dev server with live reload. Equivalent to `pnpm --filter docs start`.

## Build

```bash
pnpm build:docs
```

Generates static content into `build/`. Equivalent to `pnpm --filter docs build`.

## Content structure

Docs are organized per the [Diátaxis](https://diataxis.fr/) framework:

- `docs/tutorial/` — learning-oriented lessons
- `docs/how-to/` — problem-oriented recipes
- `docs/reference/` — one page per package, technical API descriptions
- `docs/about/` — architecture and design rationale
- `docs/project/` — maintainer-facing project info (releasing, etc.)
