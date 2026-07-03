import { D2Field } from '@dhis2-form-utils/dhis2-ui'
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata'

type EventFormFieldsProps = {
    metadata: ProgramStageMetadata
}

export function EventFormFields({ metadata }: EventFormFieldsProps) {
    return (
        <>
            {metadata.programStageDataElements.map(
                (programStageDataElement) => {
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
            )}
        </>
    )
}
