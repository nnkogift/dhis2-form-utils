import type { Mutation, QueryVariables } from '@dhis2/data-engine';

/**
 * The exact endpoint DHIS2's own Maintenance app uses to turn a raw program rule condition
 * into a plain-language sentence (see metadata-management-app's
 * `pages/programRules/fields/ConditionField.tsx` → `validationResource`). The server resolves
 * every `#{}`/`A{}`/`V{}`/`C{}` token and `d2:` function call into real entity names — logic
 * this repo has no reason to reimplement client-side.
 */
export const conditionDescriptionMutation: Mutation = {
    resource: 'programRules/condition/description',
    type: 'create',
    data: (variables: QueryVariables) => variables.condition as string,
    params: (variables: QueryVariables) => ({ programId: variables.programId as string }),
};
