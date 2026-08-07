import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    preserveModules: true,
    external: [
        'react',
        'react-dom',
        'react-hook-form',
        '@dhis2/app-runtime',
        '@hookform/resolvers',
        '@hookform/resolvers/zod',
        'zod',
        '@nnkogift/dhis2-form-utils-metadata',
        '@nnkogift/dhis2-form-utils-rules',
    ],
});
