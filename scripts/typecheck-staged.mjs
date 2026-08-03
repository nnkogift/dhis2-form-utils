import { spawnSync } from 'node:child_process';

const FULL_TYPECHECK_PATTERNS = [
    /^packages\/config\//,
    /^tsconfig[^/]*\.json$/,
    /^eslint\.config\.js$/,
    /^pnpm-workspace\.yaml$/,
    /^package\.json$/,
];

const WORKSPACE_PREFIXES = [
    ['packages/rules/', '@dhis2-form-utils/rules'],
    ['packages/metadata/', '@dhis2-form-utils/metadata'],
    ['packages/hooks/', '@dhis2-form-utils/hooks'],
    ['packages/dhis2-ui/', '@dhis2-form-utils/dhis2-ui'],
    ['packages/mantine/', '@dhis2-form-utils/mantine'],
    ['packages/mui/', '@dhis2-form-utils/mui'],
    ['apps/playground/', 'playground'],
];

function getStagedFiles() {
    const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
        encoding: 'utf8',
    });

    if (result.status !== 0) {
        console.error('Failed to read staged files');
        process.exit(result.status ?? 1);
    }

    return result.stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function run(command, args) {
    const result = spawnSync(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
    process.exit(result.status ?? 1);
}

const stagedFiles = getStagedFiles();

if (stagedFiles.length === 0) {
    process.exit(0);
}

if (stagedFiles.some((file) => FULL_TYPECHECK_PATTERNS.some((pattern) => pattern.test(file)))) {
    run('pnpm', ['-r', '--if-present', 'run', 'typecheck']);
}

const filters = new Set();

for (const file of stagedFiles) {
    for (const [prefix, filter] of WORKSPACE_PREFIXES) {
        if (file.startsWith(prefix)) {
            filters.add(filter);
            break;
        }
    }
}

if (filters.size === 0) {
    process.exit(0);
}

const args = [];
for (const filter of filters) {
    args.push('--filter', filter);
}
args.push('--if-present', 'run', 'typecheck');

run('pnpm', args);
