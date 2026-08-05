import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: 'DHIS2 Form Utils',
    tagline: 'Composable, design-system-agnostic forms for DHIS2 data entry in React',
    favicon: 'img/favicon.ico',

    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    url: 'https://nnkogift.github.io',
    baseUrl: '/dhis2-form-utils/',

    organizationName: 'nnkogift',
    projectName: 'dhis2-form-utils',

    onBrokenLinks: 'throw',

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    markdown: {
        hooks: {
            onBrokenMarkdownLinks: 'warn',
        },
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    routeBasePath: 'docs',
                    sidebarPath: './sidebars.ts',
                    editUrl: 'https://github.com/nnkogift/dhis2-form-utils/tree/main/apps/docs/',
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: 'img/docusaurus-social-card.jpg',
        colorMode: {
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: 'DHIS2 Form Utils',
            logo: {
                alt: 'DHIS2 Form Utils logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    to: '/',
                    label: 'Home',
                    position: 'left',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'docsSidebar',
                    position: 'left',
                    label: 'Docs',
                },
                {
                    href: 'https://nnkogift.github.io/dhis2-form-utils/storybook/',
                    label: 'Storybook',
                    position: 'left',
                },
                {
                    href: 'https://github.com/nnkogift/dhis2-form-utils',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        { label: 'Introduction', to: '/docs/intro' },
                        { label: 'Tutorial', to: '/docs/tutorial/build-your-first-event-form' },
                        { label: 'Reference', to: '/docs/reference/hooks' },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Storybook',
                            href: 'https://nnkogift.github.io/dhis2-form-utils/storybook/',
                        },
                        { label: 'GitHub', href: 'https://github.com/nnkogift/dhis2-form-utils' },
                        { label: 'npm', href: 'https://www.npmjs.com/org/nnkogift' },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} DHIS2 Form Utils. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ['bash', 'json', 'tsx'],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
