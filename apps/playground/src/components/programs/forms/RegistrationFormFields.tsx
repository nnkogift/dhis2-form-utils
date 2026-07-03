import { D2Field, FormSection } from '@dhis2-form-utils/dhis2-ui'
import type { TrackerProgramMetadata } from '@dhis2-form-utils/hooks'
import type { ProgramTrackedEntityAttribute } from '@dhis2-form-utils/metadata'
import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'

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
    const sections = useMemo(
        () =>
            (metadata.programSections ?? [])
                .slice()
                .sort(
                    (left, right) =>
                        (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
                ),
        [metadata.programSections]
    )
    const sectionFieldIds = useMemo(
        () =>
            new Set(
                sections.flatMap((section) =>
                    section.trackedEntityAttributes.map(
                        (attribute) => attribute.id
                    )
                )
            ),
        [sections]
    )
    const fieldsById = useMemo(
        () =>
            new Map(
                fieldConfigs.map((fieldConfig) => [fieldConfig.id, fieldConfig])
            ),
        [fieldConfigs]
    )
    const unsectionedFields = useMemo(
        () =>
            fieldConfigs.filter(
                (fieldConfig) =>
                    !sectionFieldIds.has(fieldConfig.trackedEntityAttribute.id)
            ),
        [fieldConfigs, sectionFieldIds]
    )

    return (
        <>
            {sections.map((section) => (
                <FormSection key={section.id} sectionId={section.id}>
                    <section className="flex flex-col gap-dp16 rounded border border-dhis2-grey-400 p-dp16">
                        <h3 className="m-0 text-lg font-medium">
                            {section.displayName ?? i18n.t('Section')}
                        </h3>
                        {section.trackedEntityAttributes.map((attribute) => {
                            const fieldConfig = fieldsById.get(attribute.id)
                            if (!fieldConfig) {
                                return null
                            }

                            return (
                                <D2Field
                                    key={attribute.id}
                                    field={{
                                        kind: 'trackedEntityAttribute',
                                        config: fieldConfig,
                                    }}
                                />
                            )
                        })}
                    </section>
                </FormSection>
            ))}
            {unsectionedFields.map((fieldConfig) => (
                <D2Field
                    key={fieldConfig.id}
                    field={{
                        kind: 'trackedEntityAttribute',
                        config: fieldConfig,
                    }}
                />
            ))}
        </>
    )
}
