import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    external: [
        'react',
        'react-dom',
        'react-hook-form',
        '@mantine/core',
        '@mantine/dates',
        '@mantine/hooks',
        'dayjs',
        '@nnkogift/dhis2-form-utils-hooks',
        '@nnkogift/dhis2-form-utils-map',
    ],
});
