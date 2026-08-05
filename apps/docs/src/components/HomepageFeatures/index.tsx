import type { JSX, SVGProps } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

function IconRules(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
            <path
                d="M10 8h20l8 8v24a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2.5"
            />
            <path d="M30 8v8h8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path
                d="m15 26 5 5 11-11"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function IconLayers(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
            <path
                d="M24 6 4 16l20 10 20-10Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
            />
            <path
                d="m4 24 20 10 20-10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="m4 32 20 10 20-10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function IconPuzzle(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
            <path
                d="M18 8h8a2 2 0 0 1 2 2v4a3 3 0 1 0 0 6v6a2 2 0 0 1-2 2h-6a3 3 0 1 1-6 0H8a2 2 0 0 1-2-2v-6a3 3 0 1 0 0-6v-4a2 2 0 0 1 2-2h4a3 3 0 1 1 6 0Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function IconShield(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
            <path
                d="M24 5 8 11v11c0 10 7 17.5 16 21 9-3.5 16-11 16-21V11Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
            />
            <path
                d="m17 23 5 5 9-10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function IconHeadless(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
            <circle
                cx="24"
                cy="24"
                r="17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="4 5"
            />
            <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2.5" />
        </svg>
    );
}

function IconDebug(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
            <rect
                x="14"
                y="14"
                width="20"
                height="24"
                rx="4"
                stroke="currentColor"
                strokeWidth="2.5"
            />
            <path
                d="M14 22H7M14 30H7M34 22h7M34 30h7M19 14v-3a5 5 0 0 1 10 0v3"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

type Feature = {
    title: string;
    icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    description: JSX.Element;
};

const FeatureList: Feature[] = [
    {
        title: 'Reactive program rules',
        icon: IconRules,
        description: (
            <>
                Fields hide, show, get assigned values, and surface warnings live as the user types
                — driven by the same DHIS2 program rules that run in Tracker Capture and Event
                Capture, evaluated on every meaningful change.
            </>
        ),
    },
    {
        title: 'DHIS2-native, not reinvented',
        icon: IconShield,
        description: (
            <>
                Built directly on <code>@dhis2/rule-engine</code> and{' '}
                <code>@dhis2/app-runtime</code> — the official engine and API runtime. No custom
                rule evaluation, no raw fetch calls, no drift from platform behaviour.
            </>
        ),
    },
    {
        title: 'Bring your own design system',
        icon: IconPuzzle,
        description: (
            <>
                Ships adapters for <code>@dhis2/ui</code>, Mantine, and Material UI — all built on
                the same headless primitive, so wiring up a fourth design system is a documented
                path, not a fork.
            </>
        ),
    },
    {
        title: 'Composable, layered architecture',
        icon: IconLayers,
        description: (
            <>
                Core rule/metadata utilities, headless React hooks, and UI adapters are separate,
                independently publishable packages — use only the layer you need.
            </>
        ),
    },
    {
        title: 'Headless by design',
        icon: IconHeadless,
        description: (
            <>
                Every layer works without the one above it. Drop the UI adapters entirely and build
                your own field components directly on <code>useFieldControl</code>.
            </>
        ),
    },
    {
        title: 'Rule debugging built in',
        icon: IconDebug,
        description: (
            <>
                An optional devtools package shows exactly which rules fired, why a field is hidden,
                and how fields/sections/rules relate — as a live trace and dependency graph.
            </>
        ),
    },
];

function FeatureCard({ title, icon: Icon, description }: Feature) {
    return (
        <div className={clsx('col col--4')}>
            <div className={styles.featureCard}>
                <Icon className={styles.featureIcon} aria-hidden="true" />
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props) => (
                        <FeatureCard key={props.title} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
