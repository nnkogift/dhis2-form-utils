#!/usr/bin/env node
/**
 * Re-publish packages already released to npmjs onto GitHub Packages.
 *
 * Expects `PUBLISHED_PACKAGES` JSON from changesets/action:
 *   [{"name":"@nnkogift/dhis2-form-utils-hooks","version":"0.1.0"}, ...]
 *
 * Auth: GITHUB_TOKEN must be able to write packages (workflow `packages: write`).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const publishedRaw = process.env.PUBLISHED_PACKAGES ?? '[]';
/** @type {{ name: string; version: string }[]} */
const published = JSON.parse(publishedRaw);

if (!Array.isArray(published) || published.length === 0) {
    console.log('No published packages to mirror to GitHub Packages.');
    process.exit(0);
}

const token = process.env.GITHUB_TOKEN ?? process.env.NODE_AUTH_TOKEN;
if (!token) {
    console.error('GITHUB_TOKEN (or NODE_AUTH_TOKEN) is required to publish to GitHub Packages.');
    process.exit(1);
}

const workspacePackages = JSON.parse(
    execFileSync('pnpm', ['m', 'ls', '--json', '--depth', '-1'], {
        encoding: 'utf8',
    })
);

/** @type {Map<string, string>} */
const nameToPath = new Map();
for (const pkg of workspacePackages) {
    if (pkg.name && pkg.path) {
        nameToPath.set(pkg.name, pkg.path);
    }
}

const npmrcDir = mkdtempSync(join(tmpdir(), 'gh-pkg-npmrc-'));
const npmrcPath = join(npmrcDir, '.npmrc');
writeFileSync(
    npmrcPath,
    [
        '@nnkogift:registry=https://npm.pkg.github.com',
        `//npm.pkg.github.com/:_authToken=${token}`,
        'always-auth=true',
        '',
    ].join('\n')
);

let failures = 0;

try {
    for (const { name, version } of published) {
        const pkgPath = nameToPath.get(name);
        if (!pkgPath) {
            console.error(`Could not resolve workspace path for ${name}`);
            failures += 1;
            continue;
        }

        const pkgJsonPath = join(pkgPath, 'package.json');
        if (!existsSync(pkgJsonPath)) {
            console.error(`Missing package.json at ${pkgJsonPath}`);
            failures += 1;
            continue;
        }

        const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.version !== version) {
            console.warn(
                `Warning: ${name} package.json is ${pkgJson.version}, changesets reported ${version}`
            );
        }

        console.log(`Publishing ${name}@${version} → GitHub Packages…`);
        try {
            execFileSync(
                'npm',
                [
                    'publish',
                    '--access',
                    'public',
                    '--registry',
                    'https://npm.pkg.github.com',
                    '--userconfig',
                    npmrcPath,
                ],
                {
                    cwd: pkgPath,
                    encoding: 'utf8',
                    stdio: ['ignore', 'pipe', 'pipe'],
                    env: {
                        ...process.env,
                        NODE_AUTH_TOKEN: token,
                        NPM_TOKEN: token,
                        NPM_CONFIG_USERCONFIG: npmrcPath,
                    },
                }
            );
            console.log(`Published ${name}@${version} to GitHub Packages.`);
        } catch (error) {
            const stderr =
                error && typeof error === 'object' && 'stderr' in error ? String(error.stderr) : '';
            const stdout =
                error && typeof error === 'object' && 'stdout' in error ? String(error.stdout) : '';
            const combined = `${stderr}\n${stdout}`;
            if (
                /EPUBLISHCONFLICT|Cannot publish over existing version|409\s+Conflict/i.test(
                    combined
                )
            ) {
                console.log(`${name}@${version} already exists on GitHub Packages — skipping.`);
                continue;
            }
            console.error(combined || error);
            console.error(`Failed to publish ${name}@${version} to GitHub Packages.`);
            failures += 1;
        }
    }
} finally {
    rmSync(npmrcDir, { recursive: true, force: true });
}

if (failures > 0) {
    process.exit(1);
}

console.log('GitHub Packages publish complete.');
