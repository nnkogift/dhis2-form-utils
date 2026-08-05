#!/usr/bin/env node
/**
 * Create a unified `vX.Y.Z` git tag + GitHub Release for fixed-version releases.
 *
 * Per-package tags/releases are still created by changesets/action
 * (`createGithubReleases: true`). This adds a single repo-level release that
 * matches the shared fixed version.
 *
 * Expects `PUBLISHED_PACKAGES` JSON from changesets/action.
 */
import { execFileSync } from 'node:child_process';

const publishedRaw = process.env.PUBLISHED_PACKAGES ?? '[]';
/** @type {{ name: string; version: string }[]} */
const published = JSON.parse(publishedRaw);

if (!Array.isArray(published) || published.length === 0) {
    console.log('No published packages — skipping unified GitHub Release.');
    process.exit(0);
}

const versions = [...new Set(published.map((pkg) => pkg.version))];
if (versions.length !== 1) {
    console.warn(
        `Published packages have mixed versions (${versions.join(', ')}); skipping unified tag.`
    );
    process.exit(0);
}

const version = versions[0];
const tag = `v${version}`;
const token = process.env.GITHUB_TOKEN;
if (!token) {
    console.error('GITHUB_TOKEN is required to create a GitHub Release.');
    process.exit(1);
}

const packageList = published.map((pkg) => `- \`${pkg.name}@${pkg.version}\``).join('\n');
const body = [
    `Release **${tag}** of \`@nnkogift/dhis2-form-utils-*\`.`,
    '',
    '### Packages',
    packageList,
    '',
    'Published to [npmjs.com](https://www.npmjs.com) and [GitHub Packages](https://github.com/nnkogift/dhis2-form-utils/packages).',
].join('\n');

const env = {
    ...process.env,
    GH_TOKEN: token,
    GITHUB_TOKEN: token,
    GIT_TERMINAL_PROMPT: '0',
};

/**
 * @param {string} command
 * @param {string[]} args
 */
function run(command, args) {
    return execFileSync(command, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env,
    });
}

/**
 * @param {string} command
 * @param {string[]} args
 */
function runInherit(command, args) {
    execFileSync(command, args, { stdio: 'inherit', env });
}

/**
 * @param {string} command
 * @param {string[]} args
 */
function succeeds(command, args) {
    try {
        run(command, args);
        return true;
    } catch {
        return false;
    }
}

if (!succeeds('git', ['rev-parse', tag])) {
    console.log(`Creating tag ${tag}…`);
    runInherit('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);
}

try {
    runInherit('git', ['push', 'origin', tag]);
} catch {
    console.log(`Tag ${tag} may already exist on origin — continuing.`);
}

if (succeeds('gh', ['release', 'view', tag])) {
    console.log(`GitHub Release ${tag} already exists — updating notes.`);
    runInherit('gh', ['release', 'edit', tag, '--title', tag, '--notes', body]);
} else {
    console.log(`Creating GitHub Release ${tag}…`);
    runInherit('gh', ['release', 'create', tag, '--title', tag, '--notes', body, '--verify-tag']);
}

console.log(`Unified release ${tag} ready.`);
