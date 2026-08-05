import { defineConfig } from 'tsup';

/**
 * Rewrite relative bare specifiers to include `.js` so Node ESM can resolve
 * preserveModules output (`./enums` → `./enums.js`).
 */
function relativeImportJsExtensionPlugin() {
    return {
        name: 'relative-import-js-extension',
        setup(build) {
            build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async (args) => {
                const { readFile } = await import('node:fs/promises');
                const source = await readFile(args.path, 'utf8');
                const contents = source.replace(
                    /(from\s+['"])(\.[^'"]+)(['"])/g,
                    (full, start, spec, end) => {
                        if (/\.(js|jsx|ts|tsx|json|css|mjs|cjs)$/.test(spec)) {
                            return full;
                        }
                        return `${start}${spec}.js${end}`;
                    }
                );
                const loader = args.path.endsWith('.tsx')
                    ? 'tsx'
                    : args.path.endsWith('.ts')
                      ? 'ts'
                      : args.path.endsWith('.jsx')
                        ? 'jsx'
                        : 'js';
                return { contents, loader };
            });
        },
    };
}

/**
 * Shared tsup options for publishable `@nnkogift/dhis2-form-utils-*` packages.
 * Unminified, sourcemaps for local/CI debug; maps are excluded from npm via `.npmignore`.
 *
 * @param {object} [options]
 * @param {string[]} [options.entry]
 * @param {boolean} [options.preserveModules]
 * @param {Array<string | RegExp>} [options.external]
 */
export function createLibTsupConfig({ entry, preserveModules = false, external = [] } = {}) {
    const shared = {
        dts: true,
        sourcemap: true,
        treeshake: true,
        splitting: false,
        minify: false,
        external,
    };

    if (!preserveModules) {
        return defineConfig((options) => ({
            ...shared,
            entry: entry ?? ['src/index.ts'],
            format: ['esm', 'cjs'],
            clean: !options.watch,
            bundle: true,
        }));
    }

    const moduleEntries = entry ?? [
        'src/**/*.ts',
        'src/**/*.tsx',
        '!src/**/*.test.ts',
        '!src/**/*.test.tsx',
        '!src/**/__tests__/**',
        '!src/**/test/**',
    ];

    // ESM: preserveModules for tree-shaking. CJS: single bundle (Node require + tree-shake N/A).
    return defineConfig((options) => [
        {
            ...shared,
            entry: moduleEntries,
            format: ['esm'],
            outExtension: () => ({ js: '.js' }),
            clean: !options.watch,
            bundle: false,
            preserveModules: true,
            preserveModulesRoot: 'src',
            esbuildPlugins: [relativeImportJsExtensionPlugin()],
        },
        {
            ...shared,
            entry: ['src/index.ts'],
            format: ['cjs'],
            outExtension: () => ({ js: '.cjs' }),
            clean: false,
            bundle: true,
            dts: false,
        },
    ]);
}
