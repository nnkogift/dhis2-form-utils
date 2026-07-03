import { D2Field, FormSection } from '@dhis2-form-utils/dhis2-ui'
import type {
    ProgramStageDataElement,
    ProgramStageMetadata,
} from '@dhis2-form-utils/metadata'
import {
    getProgramStageSectionDataElementIds,
    resolveFormSectionLayout,
} from '@dhis2-form-utils/metadata'
import { useMemo } from 'react'
import { defaultSectionTitle, FormSectionCard } from './FormSectionCard'

type EventFormFieldsProps = {
    metadata: ProgramStageMetadata
}

function renderDataElementField(
    programStageDataElement: ProgramStageDataElement
) {
    const fieldId = programStageDataElement.dataElement?.id
    if (!fieldId) {
        return null
    }

    return (
        <D2Field
            key={fieldId}
            field={{
                kind: 'dataElement',
                config: programStageDataElement,
            }}
        />
    )
}

export function EventFormFields({ metadata }: EventFormFieldsProps) {
    const programStageDataElements = metadata.programStageDataElements ?? []
    const fieldsByDataElementId = useMemo(
        () =>
            new Map(
                programStageDataElements
                    .map((programStageDataElement) => {
                        const fieldId = programStageDataElement.dataElement?.id
                        if (!fieldId) {
                            return null
                        }

                        return [fieldId, programStageDataElement] as const
                    })
                    .filter(
                        (
                            entry
                        ): entry is readonly [
                            string,
                            ProgramStageDataElement,
                        ] => entry !== null
                    )
            ),
        [programStageDataElements]
    )

    const programStageSections = metadata.programStageSections ?? []

    if (programStageSections.length === 0) {
        return <>{programStageDataElements.map(renderDataElementField)}</>
    }

    const layout = resolveFormSectionLayout({
        sections: programStageSections,
        fields: programStageDataElements,
        getSectionId: (section) => section.id,
        getSectionDisplayName: (section) => section.displayName,
        getSortOrder: (section) => section.sortOrder ?? 0,
        getSectionItemIds: getProgramStageSectionDataElementIds,
        getFieldId: (programStageDataElement) =>
            programStageDataElement.dataElement?.id,
    })

    return (
        <>
            {layout.sections.map((section) => (
                <FormSection key={section.id} sectionId={section.id}>
                    <FormSectionCard
                        title={defaultSectionTitle(section.displayName)}
                    >
                        {section.itemIds.map((fieldId) => {
                            const programStageDataElement =
                                fieldsByDataElementId.get(fieldId)
                            if (!programStageDataElement) {
                                return null
                            }

                            return renderDataElementField(
                                programStageDataElement
                            )
                        })}
                    </FormSectionCard>
                </FormSection>
            ))}
            {layout.unsectionedItemIds.map((fieldId) => {
                const programStageDataElement =
                    fieldsByDataElementId.get(fieldId)
                if (!programStageDataElement) {
                    return null
                }

                return renderDataElementField(programStageDataElement)
            })}
        </>
    )
}
