import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    preserveModules: true,
    external: ['@dhis2/rule-engine', '@nnkogift/dhis2-form-utils-metadata'],
});
