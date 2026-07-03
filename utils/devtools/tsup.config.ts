import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', '@dhis2/ui', '@dhis2/d2-i18n', '@xyflow/react'],
    esbuildOptions(options) {
        options.loader = {
            ...options.loader,
            '.css': 'css',
        };
    },
});
