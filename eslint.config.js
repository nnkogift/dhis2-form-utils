// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/storybook-static/**',
            '**/coverage/**',
            '**/.storybook/**',
            'eslint.config.js',
            'vitest.config.ts',
            '**/*.config.ts',
            '**/vite.config.ts',
            '**/playwright.config.ts',
        ],
    },
    js.configs.recommended,
    prettierConfig,
    ...tseslint.configs.strictTypeChecked.map((config) => ({
        ...config,
        files: ['**/*.{ts,tsx}'],
    })),
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
            },
        },
    },
    {
        files: [
            'apps/storybook/interactions/**/*.{ts,tsx}',
            'apps/storybook/stories/**/*.{ts,tsx}',
            'apps/storybook/decorators/**/*.{ts,tsx}',
            'apps/storybook/fixtures/**/*.{ts,tsx}',
            'apps/storybook/components/**/*.{ts,tsx}',
        ],
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-deprecated': 'off',
        },
    },
    storybook.configs['flat/recommended']
);
