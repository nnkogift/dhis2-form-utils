import { FormStore } from '../formStore';
import { FormStateProvider } from '../FormStateContext';
import type { OptionGroupCodeMap } from '@nnkogift/dhis2-form-utils-metadata';
import type { FieldStateMap } from '@nnkogift/dhis2-form-utils-rules';
import { renderHook, type RenderHookOptions } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
    FormProvider,
    useForm,
    useFormContext,
    type Control,
    type UseFormProps,
    type UseFormReturn,
} from 'react-hook-form';

export type FieldControlWrapperOptions = {
    defaultValues?: Record<string, string>;
    fieldState?: FieldStateMap;
    optionGroups?: OptionGroupCodeMap;
    formOptions?: UseFormProps<Record<string, string>>;
};

function FieldControlWrapper({
    children,
    defaultValues = {},
    fieldState = {},
    optionGroups,
    formOptions,
}: {
    children: ReactNode;
} & FieldControlWrapperOptions) {
    const form = useForm<Record<string, string>>({ defaultValues, ...formOptions });
    const formStore = useMemo(() => {
        const store = new FormStore();
        store.fieldStore.setState(fieldState);
        store.setOptionGroups(optionGroups);
        return store;
    }, [fieldState, optionGroups]);

    return (
        <FormStateProvider
            formStore={formStore}
            form={form as UseFormReturn<Record<string, unknown>>}
        >
            <FormProvider {...form}>{children}</FormProvider>
        </FormStateProvider>
    );
}

export function renderFieldControlHook<Result>(
    callback: (control: Control<Record<string, string>>) => Result,
    options?: RenderHookOptions<unknown> & FieldControlWrapperOptions
) {
    const { defaultValues, fieldState, optionGroups, formOptions, ...hookOptions } = options ?? {};

    return renderHook(
        () => {
            const { control } = useFormContext<Record<string, string>>();
            return callback(control);
        },
        {
            ...hookOptions,
            wrapper: ({ children }) => (
                <FieldControlWrapper
                    defaultValues={defaultValues}
                    fieldState={fieldState}
                    optionGroups={optionGroups}
                    formOptions={formOptions}
                >
                    {children}
                </FieldControlWrapper>
            ),
        }
    );
}
