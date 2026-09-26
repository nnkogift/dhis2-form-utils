import type { ProgramRuleVariableLike } from './RuleDetailsModal';

type VariableKind =
    | 'Data element'
    | 'Tracked entity attribute'
    | 'Environment variable'
    | 'Function';

export type VariableChip = {
    token: string;
    kind: VariableKind;
    label: string;
    className: string;
};

const VARIABLE_PATTERNS: Array<{ pattern: RegExp; kind: VariableKind; className: string }> = [
    {
        pattern: /#\{[^}]*\}/g,
        kind: 'Data element',
        className: 'bg-dhis2-blue-100 text-dhis2-blue-900',
    },
    {
        pattern: /A\{[^}]*\}/g,
        kind: 'Tracked entity attribute',
        className: 'bg-dhis2-teal-100 text-dhis2-teal-900',
    },
    {
        pattern: /V\{[^}]*\}/g,
        kind: 'Environment variable',
        className: 'bg-dhis2-grey-200 text-dhis2-grey-900',
    },
    {
        pattern: /d2:\w+(?=\()/g,
        kind: 'Function',
        className: 'bg-dhis2-yellow-100 text-dhis2-yellow-900',
    },
];

const RESOLVABLE_VARIABLE_KINDS: ReadonlySet<VariableKind> = new Set([
    'Data element',
    'Tracked entity attribute',
]);

function resolveVariableDisplayName(
    name: string,
    programRuleVariables: readonly ProgramRuleVariableLike[]
): string | undefined {
    const variable = programRuleVariables.find((candidate) => candidate.name === name);
    return variable?.dataElement?.displayName ?? variable?.trackedEntityAttribute?.displayName;
}

/** `#{name}`/`A{name}` reference a program rule *variable* name, not a metadata uid directly — resolve via `programRuleVariables`. */
function resolveVariableToken(
    token: string,
    kind: VariableKind,
    programRuleVariables: readonly ProgramRuleVariableLike[]
): string {
    if (kind === 'Function') {
        return `${token}()`;
    }
    if (!RESOLVABLE_VARIABLE_KINDS.has(kind)) {
        return token;
    }
    return resolveVariableDisplayName(token.slice(2, -1), programRuleVariables) ?? token;
}

function matchDistinctTokens(condition: string, pattern: RegExp, seen: Set<string>): string[] {
    const matches = condition.match(pattern) ?? [];
    const distinct = matches.filter((token) => !seen.has(token));
    for (const token of distinct) {
        seen.add(token);
    }
    return distinct;
}

export function parseConditionVariables(
    condition: string | undefined,
    programRuleVariables: readonly ProgramRuleVariableLike[]
): VariableChip[] {
    if (!condition) {
        return [];
    }
    const seen = new Set<string>();
    return VARIABLE_PATTERNS.flatMap(({ pattern, kind, className }) =>
        matchDistinctTokens(condition, pattern, seen).map((token) => ({
            token,
            kind,
            label: resolveVariableToken(token, kind, programRuleVariables),
            className,
        }))
    );
}
