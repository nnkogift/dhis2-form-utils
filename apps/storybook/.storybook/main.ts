import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.@(ts|tsx)'],

    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-a11y',
        '@storybook/addon-vitest',
        '@storybook/addon-mcp',
    ],

    framework: {
        name: '@storybook/react-vite',
        options: {},
    },

    staticDirs: ['../public'],
};

export default config;
