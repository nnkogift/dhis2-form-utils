import { useMemo } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { TrackerProgramMetadata } from '@dhis2-form-utils/hooks'
import type { ProgramTrackedEntityAttribute } from '@dhis2-form-utils/metadata'
import { resolveFormSectionLayout } from '@dhis2-form-utils/metadata'
import { RuleAwareField } from '@/components/rules/RuleAwareField'
import { defaultSectionTitle, FormSectionCard } from './FormSectionCard'

type RegistrationFormFieldsProps = {
    metadata: TrackerProgramMetadata
}

function toFieldConfig(
    attribute: TrackerProgramMetadata['programTrackedEntityAttributes'][number]
): ProgramTrackedEntityAttribute {
    return {
        ...attribute,
        trackedEntityAttribute: {
            ...attribute.trackedEntityAttribute,
            displayFormName:
                attribute.trackedEntityAttribute.formName ??
                attribute.trackedEntityAttribute.displayName,
        },
    } as unknown as ProgramTrackedEntityAttribute
}

function renderTeaField(fieldConfig: ProgramTrackedEntityAttribute) {
    return (
        <RuleAwareField
            key={fieldConfig.id}
            field={{
                kind: 'trackedEntityAttribute',
                config: fieldConfig,
            }}
        />
    )
}

export function RegistrationFormFields({
    metadata,
}: RegistrationFormFieldsProps) {
    const fieldConfigs = useMemo(
        () =>
            metadata.programTrackedEntityAttributes
                .slice()
                .sort(
                    (left, right) =>
                        (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
                )
                .map(toFieldConfig),
        [metadata.programTrackedEntityAttributes]
    )
    const sections = metadata.programSections ?? []
    const fieldsByTeaId = useMemo(
        () =>
            new Map(
                fieldConfigs.map((fieldConfig) => [
                    fieldConfig.trackedEntityAttribute.id,
                    fieldConfig,
                ])
            ),
        [fieldConfigs]
    )

    if (sections.length === 0) {
        return <>{fieldConfigs.map(renderTeaField)}</>
    }

    const layout = resolveFormSectionLayout({
        sections,
        fields: fieldConfigs,
        getSectionId: (section) => section.id,
        getSectionDisplayName: (section) => section.displayName,
        getSortOrder: (section) => section.sortOrder ?? 0,
        getSectionItemIds: (section) => {
            return section.trackedEntityAttributes.map(
                (attribute) => attribute.id
            )
        },
        getFieldId: (fieldConfig) => fieldConfig.trackedEntityAttribute.id,
    })

    return (
        <>
            {layout.sections.map((section) => (
                <FormSectionCard
                    key={section.id}
                    sectionId={section.id}
                    title={defaultSectionTitle(section.displayName)}
                    note={i18n.t('{{count}} attributes', {
                        count: section.itemIds.length,
                    })}
                >
                    {section.itemIds.map((teaId) => {
                        const fieldConfig = fieldsByTeaId.get(teaId)
                        if (!fieldConfig) {
                            return null
                        }

                        return renderTeaField(fieldConfig)
                    })}
                </FormSectionCard>
            ))}
            {layout.unsectionedItemIds.map((teaId) => {
                const fieldConfig = fieldsByTeaId.get(teaId)
                if (!fieldConfig) {
                    return null
                }

                return renderTeaField(fieldConfig)
            })}
        </>
    )
}
