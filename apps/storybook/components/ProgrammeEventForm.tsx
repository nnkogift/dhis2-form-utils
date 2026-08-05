import { FormSection } from '@dhis2-form-utils/dhis2-ui';
import type { FieldControlInput } from '@dhis2-form-utils/hooks';
import type { ProgramStageDataElement } from '@dhis2-form-utils/metadata';
import {
    getProgramStageSectionDataElementIds,
    resolveFormSectionLayout,
} from '@dhis2-form-utils/metadata';
import { useMemo } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { useEventFormStory } from '../decorators/withEventForm';

export type EventFormFieldProps = {
    field: FieldControlInput;
};

type ProgrammeEventFormProps = {
    Field: ComponentType<EventFormFieldProps>;
    Feedback?: ComponentType;
    submitLabel?: string;
};

function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <section
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                border: '1px solid #bdbdbd',
                borderRadius: 4,
                padding: 16,
            }}
        >
            {title ? <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3> : null}
            {children}
        </section>
    );
}

export function ProgrammeEventForm({
    Field,
    Feedback,
    submitLabel = 'Save',
}: ProgrammeEventFormProps) {
    const { handleSubmit } = useFormContext<Record<string, string>>();
    const { stageMetadata } = useEventFormStory();
    const programStageDataElements = useMemo(
        () => stageMetadata?.programStageDataElements ?? [],
        [stageMetadata?.programStageDataElements]
    );

    const fieldsByDataElementId = useMemo(
        () =>
            new Map(
                programStageDataElements
                    .map((programStageDataElement) => {
                        const fieldId = programStageDataElement.dataElement?.id;
                        if (!fieldId) {
                            return null;
                        }

                        return [fieldId, programStageDataElement] as const;
                    })
                    .filter(
                        (entry): entry is readonly [string, ProgramStageDataElement] =>
                            entry !== null
                    )
            ),
        [programStageDataElements]
    );

    const renderField = (programStageDataElement: ProgramStageDataElement) => {
        const fieldId = programStageDataElement.dataElement?.id;
        if (!fieldId) {
            return null;
        }

        return (
            <Field key={fieldId} field={{ kind: 'dataElement', config: programStageDataElement }} />
        );
    };

    const programStageSections = stageMetadata?.programStageSections ?? [];

    const fieldContent =
        programStageSections.length === 0
            ? programStageDataElements.map(renderField)
            : (() => {
                  const layout = resolveFormSectionLayout({
                      sections: programStageSections,
                      fields: programStageDataElements,
                      getSectionId: (section) => section.id,
                      getSectionDisplayName: (section) => section.displayName,
                      getSortOrder: (section) => section.sortOrder ?? 0,
                      getSectionItemIds: getProgramStageSectionDataElementIds,
                      getFieldId: (programStageDataElement) =>
                          programStageDataElement.dataElement?.id,
                  });

                  return (
                      <>
                          {layout.sections.map((section) => (
                              <FormSection key={section.id} sectionId={section.id}>
                                  <SectionCard title={section.displayName ?? 'Section'}>
                                      {section.itemIds.map((fieldId) => {
                                          const programStageDataElement =
                                              fieldsByDataElementId.get(fieldId);
                                          if (!programStageDataElement) {
                                              return null;
                                          }

                                          return renderField(programStageDataElement);
                                      })}
                                  </SectionCard>
                              </FormSection>
                          ))}
                          {layout.unsectionedItemIds.map((fieldId) => {
                              const programStageDataElement = fieldsByDataElementId.get(fieldId);
                              if (!programStageDataElement) {
                                  return null;
                              }

                              return renderField(programStageDataElement);
                          })}
                      </>
                  );
              })();

    return (
        <form
            onSubmit={(event) => {
                void handleSubmit((values) => {
                    void values;
                })(event);
            }}
        >
            {fieldContent}
            {Feedback ? <Feedback /> : null}
            <button type="submit" style={{ marginTop: 16 }}>
                {submitLabel}
            </button>
        </form>
    );
}
