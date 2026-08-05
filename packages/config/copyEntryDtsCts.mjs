import { copyFile } from 'node:fs/promises';

/** Mirror `dist/index.d.ts` → `dist/index.d.cts` for dual-package `require` types. */
await copyFile('dist/index.d.ts', 'dist/index.d.cts');
