import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: !options.watch,
    external: ['react', 'react-dom', '@dhis2/ui', '@dhis2/d2-i18n', '@xyflow/react'],
}));
