import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    external: [
        'react',
        'react-dom',
        '@dhis2/ui',
        '@dhis2/d2-i18n',
        '@xyflow/react',
        '@nnkogift/dhis2-form-utils-hooks',
        '@nnkogift/dhis2-form-utils-metadata',
    ],
});
