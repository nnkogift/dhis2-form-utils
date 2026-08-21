import { http, HttpResponse } from 'msw';
import eventProgramRulesJson from '../fixtures/event-program-rules-example.json';
import trackerProgramRulesJson from '../fixtures/tracker-program-rules-example.json';

/**
 * 1x1 transparent PNG, base64-inlined (not read from disk) — these handlers
 * run in the browser (Storybook's Vite browser-mode tests), where `node:fs`
 * is unavailable.
 */
const BLANK_TILE_PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function decodeBase64Png(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

const blankTilePng = decodeBase64Png(BLANK_TILE_PNG_BASE64);

// `@dhis2-ui/organisation-unit-tree` validates ids/paths against the real DHIS2 uid shape
// (11 alphanumeric characters) — these are the well-known DHIS2 demo instance ids for
// Sierra Leone / Bo / Bombali, chosen so the fixture data is shape-valid.
const FIXTURE_ROOT_OU = { id: 'ImspTQPwCqd', displayName: 'Sierra Leone' };
const FIXTURE_ORG_UNITS = [
    {
        id: 'ImspTQPwCqd',
        displayName: 'Sierra Leone',
        ancestors: [],
    },
    {
        id: 'O6uvpzGd5pu',
        displayName: 'Bo District',
        ancestors: [FIXTURE_ROOT_OU],
    },
    {
        id: 'fdc6uOvgoji',
        displayName: 'Bombali District',
        ancestors: [FIXTURE_ROOT_OU],
    },
];

/**
 * `@dhis2-ui/organisation-unit-tree` fetches each root/expanded node
 * individually via `GET organisationUnits/{id}`, but with a DIFFERENT
 * `fields` param depending on what it's asking for — `path,children::size`
 * wants a child COUNT (number), `children[id,path,displayName]` wants the
 * actual child NODES (array). Same endpoint, same fixture data, different
 * shape — inspect `fields` to answer correctly.
 */
const FIXTURE_ORG_UNIT_PATH = (id: string) => {
    const unit = FIXTURE_ORG_UNITS.find((candidate) => candidate.id === id);
    if (!unit) return `/${id}`;
    return `/${[...unit.ancestors.map((a) => a.id), unit.id].join('/')}`;
};
const FIXTURE_ORG_UNIT_CHILDREN = (id: string) =>
    FIXTURE_ORG_UNITS.filter((unit) => unit.ancestors.some((a) => a.id === id)).map((child) => ({
        id: child.id,
        path: FIXTURE_ORG_UNIT_PATH(child.id),
        displayName: child.displayName,
    }));

const FIXTURE_FILE_RESOURCE_ID = 'fixture-uuid-0000-0000-000000000000';

type RawRef = { id: string };
type RawNamed = { id: string; name?: string; displayName?: string };
type ResolvedRef = { id: string; displayName?: string } | undefined;

function indexById<T extends { id: string }>(items: readonly T[] | undefined): Map<string, T> {
    return new Map((items ?? []).map((item) => [item.id, item]));
}

function resolveDisplayName(item: RawNamed | undefined): string | undefined {
    return item?.displayName ?? item?.name;
}

function resolveRef(ref: RawRef | undefined, byId: Map<string, RawNamed>): ResolvedRef {
    if (!ref) {
        return undefined;
    }
    return { id: ref.id, displayName: resolveDisplayName(byId.get(ref.id)) };
}

/**
 * Builds the lookup indices `RuleDetailsModal`'s `programRules/{id}` fetch needs, from the
 * flat metadata-export fixture JSON (same files `apps/storybook/fixtures/*ProgramRules.ts`
 * denormalize for the catalog list query) — see `RuleDetailsModal`/`programRuleDetailQuery`
 * in `@nnkogift/dhis2-form-utils-devtools`.
 */
function buildRuleDetailIndex(exportData: {
    programRules?: unknown[];
    programRuleActions?: unknown[];
    dataElements?: unknown[];
    trackedEntityAttributes?: unknown[];
    options?: unknown[];
    optionGroups?: unknown[];
    programStageSections?: unknown[];
    programStages?: unknown[];
    programs?: unknown[];
}) {
    return {
        rulesById: indexById(exportData.programRules as (RawNamed & Record<string, unknown>)[]),
        actionsById: indexById(
            exportData.programRuleActions as (RawNamed & Record<string, unknown>)[]
        ),
        dataElementsById: indexById(exportData.dataElements as RawNamed[]),
        teasById: indexById(exportData.trackedEntityAttributes as RawNamed[]),
        optionsById: indexById(exportData.options as RawNamed[]),
        optionGroupsById: indexById(exportData.optionGroups as RawNamed[]),
        stageSectionsById: indexById(exportData.programStageSections as RawNamed[]),
        stagesById: indexById(exportData.programStages as RawNamed[]),
        programsById: indexById(exportData.programs as RawNamed[]),
    };
}

const RULE_DETAIL_INDICES = [
    buildRuleDetailIndex(trackerProgramRulesJson),
    buildRuleDetailIndex(eventProgramRulesJson),
];

// fallow-ignore-next-line complexity
function resolveProgramRuleDetail(ruleId: string): Record<string, unknown> | undefined {
    for (const idx of RULE_DETAIL_INDICES) {
        const rule = idx.rulesById.get(ruleId) as
            | (RawNamed & {
                  description?: string;
                  condition?: string;
                  priority?: number;
                  lastUpdated?: string;
                  lastUpdatedBy?: { name?: string; displayName?: string };
                  program?: RawRef;
                  programStage?: RawRef;
                  programRuleActions?: RawRef[];
              })
            | undefined;
        if (!rule) continue;

        const actions = (rule.programRuleActions ?? [])
            .map((ref) => idx.actionsById.get(ref.id))
            .filter((action): action is NonNullable<typeof action> => Boolean(action))
            .map((action) => {
                const raw = action as Record<string, unknown> & { id: string };
                return {
                    id: raw.id,
                    programRuleActionType: raw.programRuleActionType,
                    priority: raw.priority,
                    content: raw.content,
                    data: raw.data,
                    location: raw.location,
                    dataElement: resolveRef(raw.dataElement as RawRef, idx.dataElementsById),
                    trackedEntityAttribute: resolveRef(
                        raw.trackedEntityAttribute as RawRef,
                        idx.teasById
                    ),
                    option: resolveRef(raw.option as RawRef, idx.optionsById),
                    optionGroup: resolveRef(raw.optionGroup as RawRef, idx.optionGroupsById),
                    programStageSection: resolveRef(
                        raw.programStageSection as RawRef,
                        idx.stageSectionsById
                    ),
                    programStage: resolveRef(raw.programStage as RawRef, idx.stagesById),
                    programSection: raw.programSection,
                };
            });

        return {
            id: rule.id,
            name: rule.name,
            displayName: rule.name,
            description: rule.description,
            condition: rule.condition,
            priority: rule.priority,
            lastUpdated: rule.lastUpdated,
            lastUpdatedBy: rule.lastUpdatedBy
                ? { displayName: rule.lastUpdatedBy.displayName ?? rule.lastUpdatedBy.name }
                : undefined,
            program: resolveRef(rule.program, idx.programsById),
            programStage: resolveRef(rule.programStage, idx.stagesById),
            programRuleActions: actions,
        };
    }
    return undefined;
}

/**
 * `@dhis2/data-engine`'s RestAPILink prefixes requests with the configured
 * `apiVersion` (e.g. `/api/41/me`, not `/api/me`) — plain `/api/me*`-style
 * MSW path patterns silently never match that, so every handler below uses a
 * regex tolerating an optional numeric version segment.
 */
const apiPath = (resource: string) =>
    new RegExp(`^https://debug\\.dhis2\\.org/api/(\\d+/)?${resource}`);

export const mswHandlers = {
    dhis2: [
        http.get(apiPath('me'), () =>
            HttpResponse.json({ organisationUnits: [{ id: FIXTURE_ROOT_OU.id }] })
        ),
        // Single-unit lookup (org-unit-tree fetches each root/expanded node individually) —
        // must come before the list handler below since it's a more specific path.
        // fallow-ignore-next-line complexity
        http.get(apiPath('organisationUnits/([A-Za-z0-9]+)'), ({ request }) => {
            const url = new URL(request.url);
            const id = url.pathname.split('/').filter(Boolean).pop() ?? '';
            const unit = FIXTURE_ORG_UNITS.find((candidate) => candidate.id === id);
            const fields = url.searchParams.get('fields') ?? '';
            const children = fields.includes('children[')
                ? FIXTURE_ORG_UNIT_CHILDREN(id)
                : FIXTURE_ORG_UNIT_CHILDREN(id).length;
            return HttpResponse.json({
                id,
                displayName: unit?.displayName ?? id,
                path: FIXTURE_ORG_UNIT_PATH(id),
                children,
            });
        }),
        http.get(apiPath('organisationUnits'), () =>
            HttpResponse.json({ organisationUnits: FIXTURE_ORG_UNITS })
        ),
        http.post(apiPath('fileResources$'), () =>
            HttpResponse.json({
                response: {
                    fileResource: { id: FIXTURE_FILE_RESOURCE_ID, name: 'fixture.png' },
                },
            })
        ),
        http.get(
            apiPath(`fileResources/${FIXTURE_FILE_RESOURCE_ID}/data`),
            () => new HttpResponse(blankTilePng, { headers: { 'Content-Type': 'image/png' } })
        ),
        // `RuleDetailsModal`'s lazy `programRules/{id}` fetch — resolved from the same flat
        // metadata-export fixtures the catalog list query denormalizes.
        http.get(apiPath('programRules/([A-Za-z0-9]+)'), ({ request }) => {
            const url = new URL(request.url);
            const id = url.pathname.split('/').filter(Boolean).pop() ?? '';
            const detail = resolveProgramRuleDetail(id);
            if (!detail) {
                return new HttpResponse(null, { status: 404 });
            }
            return HttpResponse.json(detail);
        }),
        // Generic fallback — must stay last so the more specific handlers above win.
        http.get(apiPath(''), () => HttpResponse.json({ status: 'ok' })),
    ],
    maptiles: [
        // Intercepts OSM raster tiles so map stories are deterministic and don't hit the network.
        http.get(
            'https://tile.openstreetmap.org/:z/:x/:y.png',
            () => new HttpResponse(blankTilePng, { headers: { 'Content-Type': 'image/png' } })
        ),
    ],
};
