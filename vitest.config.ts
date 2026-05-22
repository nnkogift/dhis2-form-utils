import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: [
            'packages/rules',
            'packages/metadata',
            'packages/hooks',
            'packages/dhis2-ui',
            'packages/mantine',
            'packages/mui',
        ],
    },
});
