import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: !options.watch,
    external: [
        'react',
        'react-dom',
        'react-hook-form',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        '@dhis2-form-utils/hooks',
    ],
}));
