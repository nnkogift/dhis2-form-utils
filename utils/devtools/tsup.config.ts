import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    preserveModules: true,
    external: [
        'react',
        'react-dom',
        '@dhis2/ui',
        '@dhis2/d2-i18n',
        '@dhis2/app-runtime',
        '@dhis2/data-engine',
        '@xyflow/react',
        '@nnkogift/dhis2-form-utils-hooks',
        '@nnkogift/dhis2-form-utils-metadata',
    ],
});
