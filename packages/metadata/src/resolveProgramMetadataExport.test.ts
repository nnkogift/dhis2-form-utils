import { describe, expect, it } from 'vitest';
import {
    resolveEventProgramMetadata,
    resolveProgramStageMetadata,
    resolveTrackerProgramMetadata,
    type ProgramMetadataExport,
} from './resolveProgramMetadataExport';

const minimalExport: ProgramMetadataExport = {
    programs: [
        {
            id: 'prog1',
            displayName: 'Test Program',
            code: 'TP',
            programType: 'WITHOUT_REGISTRATION',
            programStages: [{ id: 'stage1' }],
        },
    ],
    programStages: [
        {
            id: 'stage1',
            displayName: 'Stage 1',
            programStageDataElements: [
                {
                    id: 'psde1',
                    compulsory: true,
                    dataElement: { id: 'de1' },
                },
            ],
        },
    ],
    dataElements: [
        {
            id: 'de1',
            name: 'Weight',
            valueType: 'NUMBER',
        },
    ],
    programRules: [
        {
            id: 'rule1',
            condition: 'true',
            program: { id: 'prog1' },
            programStage: { id: 'stage1' },
            programRuleActions: [{ id: 'action1' }],
        },
    ],
    programRuleActions: [
        {
            id: 'action1',
            programRuleActionType: 'HIDEFIELD',
            dataElement: { id: 'de1' },
        },
    ],
    programRuleVariables: [
        {
            id: 'var1',
            name: 'de_var',
            programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT',
            programStage: { id: 'stage1' },
            dataElement: { id: 'de1' },
        },
    ],
};

describe('resolveProgramMetadataExport', () => {
    it('resolves program stage metadata from export', () => {
        const stage = resolveProgramStageMetadata(minimalExport, 'stage1');

        expect(stage.id).toBe('stage1');
        expect(stage.programStageDataElements).toHaveLength(1);
        expect(stage.programStageDataElements?.[0]?.dataElement?.displayName).toBe('Weight');
    });

    it('resolves event program metadata with all stages and program-level rules', () => {
        const program = resolveEventProgramMetadata(minimalExport, 'prog1');

        expect(program.id).toBe('prog1');
        expect(program.code).toBe('TP');
        expect(program.programStages).toHaveLength(1);
        expect(program.programRules).toHaveLength(1);
        expect(program.programRuleVariables).toHaveLength(1);
    });

    it('resolves tracker program metadata from export', () => {
        const trackerExport: ProgramMetadataExport = {
            ...minimalExport,
            programs: [
                {
                    id: 'tracker1',
                    displayName: 'Tracker',
                    trackedEntityType: { id: 'person' },
                    programTrackedEntityAttributes: [
                        {
                            id: 'ptea1',
                            mandatory: true,
                            sortOrder: 1,
                            trackedEntityAttribute: { id: 'tea1' },
                        },
                    ],
                    programSections: [
                        {
                            id: 'progSection1',
                            displayName: 'Demographics',
                            sortOrder: 1,
                            trackedEntityAttributes: [{ id: 'tea1' }],
                        },
                    ],
                },
            ],
            trackedEntityAttributes: [
                {
                    id: 'tea1',
                    name: 'First name',
                    valueType: 'TEXT',
                },
            ],
            programRules: [
                {
                    id: 'enrollRule',
                    condition: 'true',
                    program: { id: 'tracker1' },
                    programRuleActions: [{ id: 'enrollAction' }, { id: 'hideSectionAction' }],
                },
            ],
            programRuleActions: [
                {
                    id: 'enrollAction',
                    programRuleActionType: 'HIDEFIELD',
                    trackedEntityAttribute: { id: 'tea1' },
                },
                {
                    id: 'hideSectionAction',
                    programRuleActionType: 'HIDESECTION',
                    programSection: { id: 'progSection1' },
                },
            ],
            programRuleVariables: [
                {
                    id: 'enrollVar',
                    name: 'tea_var',
                    programRuleVariableSourceType: 'TEI_ATTRIBUTE',
                    trackedEntityAttribute: { id: 'tea1' },
                },
            ],
        };

        const program = resolveTrackerProgramMetadata(trackerExport, 'tracker1');

        expect(program.id).toBe('tracker1');
        expect(program.trackedEntityType.id).toBe('person');
        expect(program.programTrackedEntityAttributes).toHaveLength(1);
        expect(program.programRules).toHaveLength(1);
        expect(program.programRuleVariables).toHaveLength(1);
        expect(program.programRules[0]?.programRuleActions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    programRuleActionType: 'HIDESECTION',
                    programSection: { id: 'progSection1' },
                }),
            ])
        );
        expect(program.programSections).toEqual([
            {
                id: 'progSection1',
                displayName: 'Demographics',
                sortOrder: 1,
                trackedEntityAttributes: [{ id: 'tea1' }],
            },
        ]);
    });

    it('preserves programStageSection on event HIDESECTION rule actions', () => {
        const eventExport: ProgramMetadataExport = {
            ...minimalExport,
            programStages: [
                {
                    id: 'stage1',
                    displayName: 'Stage 1',
                    programStageDataElements: [
                        {
                            id: 'psde1',
                            compulsory: true,
                            dataElement: { id: 'de1' },
                        },
                    ],
                    programStageSections: [
                        {
                            id: 'stageSection1',
                            displayName: 'Clinical',
                            sortOrder: 1,
                            programStageSectionDataElements: [{ dataElement: { id: 'de1' } }],
                        },
                    ],
                },
            ],
            programRules: [
                {
                    id: 'hideStageSectionRule',
                    condition: 'true',
                    program: { id: 'prog1' },
                    programStage: { id: 'stage1' },
                    programRuleActions: [{ id: 'hideStageSectionAction' }],
                },
            ],
            programRuleActions: [
                {
                    id: 'hideStageSectionAction',
                    programRuleActionType: 'HIDESECTION',
                    programStageSection: { id: 'stageSection1' },
                },
            ],
        };

        const program = resolveEventProgramMetadata(eventExport, 'prog1');

        expect(program.programRules[0]?.programRuleActions).toEqual([
            expect.objectContaining({
                programRuleActionType: 'HIDESECTION',
                programStageSection: { id: 'stageSection1' },
            }),
        ]);
    });
});
