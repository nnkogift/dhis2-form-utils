import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    external: [
        'react',
        'react-dom',
        'react-hook-form',
        '@dhis2/ui',
        '@nnkogift/dhis2-form-utils-hooks',
        '@nnkogift/dhis2-form-utils-map',
    ],
});
