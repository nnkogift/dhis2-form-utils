import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: [
            'components/dhis2-ui',
            'components/mantine',
            'components/mui',
            'packages/metadata',
            'utils/rules',
            'utils/hooks',
        ],
    },
});
