import { createLibTsupConfig } from '@nnkogift/dhis2-form-utils-config/createLibTsupConfig';

export default createLibTsupConfig({
    preserveModules: true,
    external: ['react', 'react-dom', 'maplibre-gl', 'terra-draw', 'terra-draw-maplibre-gl-adapter'],
});
