import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const sidebars: SidebarsConfig = {
    docsSidebar: [
        'intro',
        {
            type: 'category',
            label: 'About',
            link: { type: 'generated-index', title: 'About' },
            items: [
                'about/architecture',
                'about/form-state-and-reactive-loop',
                'about/rule-devtools-design',
                'about/tracker-form-design',
                'about/unsupported-fields-handoff',
            ],
        },
        {
            type: 'category',
            label: 'Tutorial',
            link: { type: 'generated-index', title: 'Tutorial' },
            items: ['tutorial/build-your-first-event-form'],
        },
        {
            type: 'category',
            label: 'How-to guides',
            link: { type: 'generated-index', title: 'How-to guides' },
            items: [
                'how-to/tracker-registration-form',
                'how-to/custom-ui-adapter',
                'how-to/custom-rule-actions',
                'how-to/filter-hidden-fields',
                'how-to/debug-rules-with-devtools',
            ],
        },
        {
            type: 'category',
            label: 'Reference',
            link: { type: 'generated-index', title: 'Package reference' },
            items: [
                'reference/hooks',
                'reference/rules',
                'reference/metadata',
                'reference/dhis2-ui',
                'reference/mantine',
                'reference/mui',
                'reference/devtools',
            ],
        },
        {
            type: 'category',
            label: 'Project',
            items: ['project/releasing'],
        },
    ],
};

export default sidebars;
