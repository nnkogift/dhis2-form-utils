import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: [
        'react',
        'react-dom',
        'react-hook-form',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        '@dhis2-form-utils/hooks',
    ],
});
