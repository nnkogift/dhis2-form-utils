import { copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

/**
 * Copies maplibre-gl's stylesheet into dist/style.css so it's a real file
 * inside `files: ["dist"]` (survives npm publish) and can be exported via
 * the `./style.css` subpath — importing straight from
 * `maplibre-gl/dist/maplibre-gl.css` inside adapter source would make
 * maplibre-gl a phantom dependency of packages that only declare
 * `@nnkogift/dhis2-form-utils-map`, not `maplibre-gl` itself.
 */
const require = createRequire(import.meta.url);
const maplibreCssPath = require.resolve('maplibre-gl/dist/maplibre-gl.css');

await copyFile(maplibreCssPath, 'dist/style.css');
