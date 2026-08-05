import { useMemo } from 'react'
import i18n from '@dhis2/d2-i18n'
import type {
    ProgramStageDataElement,
    ProgramStageMetadata,
} from '@nnkogift/dhis2-form-utils-metadata'
import {
    getProgramStageSectionDataElementIds,
    resolveFormSectionLayout,
} from '@nnkogift/dhis2-form-utils-metadata'
import { RuleAwareField } from '@/components/rules/RuleAwareField'
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
        <RuleAwareField
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
        getSectionItemIds: (section) =>
            getProgramStageSectionDataElementIds(section),
        getFieldId: (programStageDataElement) =>
            programStageDataElement.dataElement?.id,
    })

    return (
        <>
            {layout.sections.map((section) => (
                <FormSectionCard
                    key={section.id}
                    sectionId={section.id}
                    title={defaultSectionTitle(section.displayName)}
                    note={i18n.t('{{count}} data elements', {
                        count: section.itemIds.length,
                    })}
                >
                    {section.itemIds.map((fieldId) => {
                        const programStageDataElement =
                            fieldsByDataElementId.get(fieldId)
                        if (!programStageDataElement) {
                            return null
                        }

                        return renderDataElementField(programStageDataElement)
                    })}
                </FormSectionCard>
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
