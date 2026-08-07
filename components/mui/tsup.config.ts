import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    external: [
        'react',
        'react-dom',
        'react-hook-form',
        '@mui/material',
        '@mui/x-date-pickers',
        '@emotion/react',
        '@emotion/styled',
        'dayjs',
        '@nnkogift/dhis2-form-utils-hooks',
        '@nnkogift/dhis2-form-utils-map',
    ],
});
