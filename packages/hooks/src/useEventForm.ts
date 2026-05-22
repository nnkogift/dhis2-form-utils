import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { buildSchema } from '@dhis2-form-utils/metadata';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import type { EffectHandler, FieldStateMap } from '@dhis2-form-utils/rules';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';

export type UseEventFormOptions = {
  programStageId?: string;
  metadata?: ProgramStageMetadata;
  existingValues?: Record<string, unknown>;
  effectHandlers?: Partial<Record<string, EffectHandler>>;
};

export type UseEventFormReturn = {
  form: UseFormReturn<Record<string, unknown>>;
  fieldState: FieldStateMap;
  isLoading: boolean;
  submit: () => void;
};

const stubMetadata: ProgramStageMetadata = {
  id: 'stub-stage',
  displayName: 'Stub Stage',
  programStageDataElements: [
    {
      dataElement: { id: 'sampleField', displayName: 'Sample Field', valueType: 'TEXT' },
    },
  ],
};

export function useEventForm(options: UseEventFormOptions = {}): UseEventFormReturn {
  const metadata = options.metadata ?? stubMetadata;
  const schema = useMemo(() => buildSchema(metadata), [metadata]);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: options.existingValues ?? {},
  });

  const fieldState: FieldStateMap = useMemo(
    () => ({
      sampleField: createEmptyFieldState(),
    }),
    []
  );

  const submit = () => {
    void form.handleSubmit(() => {
      // Stub: real implementation will call useDataMutation
    })();
  };

  return {
    form,
    fieldState,
    isLoading: false,
    submit,
  };
}
