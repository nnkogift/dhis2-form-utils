import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: !options.watch,
    external: ['react', 'react-dom', 'react-hook-form', '@dhis2/app-runtime'],
}));
