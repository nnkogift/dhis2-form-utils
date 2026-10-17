import type { ProgramStageDataElement } from '../domain/fieldFilters';
import type { TrackerProgramMetadata } from '../domain/trackerTypes';
import type { FieldSchemaInput } from './buildFieldSchema';
import { resolveRenderBounds } from './numericBounds';

type OptionSetInput = {
    options?: Array<{ code?: string; id?: string }>;
};

type TrackerAttribute = TrackerProgramMetadata['programTrackedEntityAttributes'][number];

const readOptionCodes = (optionSet?: OptionSetInput): string[] =>
    optionSet?.options
        ?.map((option) => option.code ?? option.id)
        .filter((code): code is string => Boolean(code)) ?? [];

export const eventFieldSchemaInput = (psde: ProgramStageDataElement): FieldSchemaInput => ({
    valueType: psde.dataElement?.valueType,
    required: psde.compulsory ?? false,
    allowFutureDate: psde.allowFutureDate ?? true,
    optionCodes: readOptionCodes(psde.dataElement?.optionSet),
    bounds: resolveRenderBounds(psde.renderType),
});

/** A server-generated attribute is filled on save, so it is never client-required. */
export const trackerFieldSchemaInput = (ptea: TrackerAttribute): FieldSchemaInput => ({
    valueType: ptea.trackedEntityAttribute.valueType,
    required: (ptea.mandatory ?? false) && !ptea.trackedEntityAttribute.generated,
    allowFutureDate: ptea.allowFutureDate ?? true,
    optionCodes: readOptionCodes(ptea.trackedEntityAttribute.optionSet),
    bounds: resolveRenderBounds(ptea.renderType),
});
