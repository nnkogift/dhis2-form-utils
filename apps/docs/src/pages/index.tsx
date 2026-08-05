import type { JSX } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <p className={styles.heroLead}>
                    Translate DHIS2 metadata into Zod-validated React forms, run program rules
                    reactively as fields change, and render with a design system of your choice —
                    all without reimplementing the DHIS2 rule engine or API client.
                </p>
                <div className={styles.buttons}>
                    <Link className="button button--secondary button--lg" to="/docs/intro">
                        Get started
                    </Link>
                    <Link
                        className="button button--outline button--secondary button--lg"
                        to="/docs/tutorial/build-your-first-event-form"
                    >
                        Build your first form
                    </Link>
                    <Link
                        className="button button--outline button--secondary button--lg"
                        href="https://nnkogift.github.io/dhis2-form-utils/storybook/"
                    >
                        Browse Storybook
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={siteConfig.title}
            description="Composable, design-system-agnostic form library for DHIS2 data entry in React."
        >
            <HomepageHeader />
            <main>
                <HomepageFeatures />
                <section className={styles.packages}>
                    <div className="container">
                        <Heading as="h2">Packages</Heading>
                        <div className={styles.packageTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Package</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <code>@nnkogift/dhis2-form-utils-rules</code>
                                        </td>
                                        <td>Wraps @dhis2/rule-engine — typed field state</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <code>@nnkogift/dhis2-form-utils-metadata</code>
                                        </td>
                                        <td>DHIS2 metadata → Zod schemas, queries, resolvers</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <code>@nnkogift/dhis2-form-utils-hooks</code>
                                        </td>
                                        <td>Headless React hooks composing rules + metadata</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <code>@nnkogift/dhis2-form-utils-dhis2-ui</code>
                                        </td>
                                        <td>Field components for @dhis2/ui</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <code>@nnkogift/dhis2-form-utils-mantine</code>
                                        </td>
                                        <td>Field components for Mantine</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <code>@nnkogift/dhis2-form-utils-mui</code>
                                        </td>
                                        <td>Field components for Material UI</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <code>@nnkogift/dhis2-form-utils-devtools</code>
                                        </td>
                                        <td>Optional rule trace / dependency-graph panels</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className={styles.packagesFooter}>
                            See the <Link to="/docs/intro">full introduction</Link> for
                            installation, or jump straight to the{' '}
                            <Link to="/docs/reference/hooks">reference docs</Link>.
                        </p>
                    </div>
                </section>
            </main>
        </Layout>
    );
}
