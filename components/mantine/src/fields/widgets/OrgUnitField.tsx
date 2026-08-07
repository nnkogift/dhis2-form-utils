import { Select } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    resolveFieldValidation,
    useOrgUnitPickerContext,
    useOrganisationUnitsQuery,
} from '@nnkogift/dhis2-form-utils-hooks';

/**
 * v1 scope reduction: Mantine has no org-unit tree primitive, so this renders
 * a flat searchable select over the fetched org units (ancestor path shown as
 * secondary text) rather than a hierarchical tree. A real tree widget is a
 * fast-follow, not part of this slice.
 */
// fallow-ignore-next-line complexity
export function D2OrgUnitField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const pickerContext = useOrgUnitPickerContext();
    const { organisationUnits, loading } = useOrganisationUnitsQuery(pickerContext?.roots);

    const options = organisationUnits.map((ou) => ({
        value: ou.id,
        label:
            ou.ancestors.length > 0
                ? `${ou.displayName} (${ou.ancestors.map((ancestor) => ancestor.displayName).join(' / ')})`
                : ou.displayName,
    }));

    return (
        <Select
            name={field.name}
            label={fieldConfig.label}
            description={fieldConfig.description}
            required={isMandatory}
            disabled={isDisabled}
            searchable
            clearable
            data={options}
            value={(field.value as string) || null}
            placeholder={loading ? 'Loading organisation units…' : undefined}
            error={hasError ? validationText : undefined}
            onChange={(value) => {
                field.onChange(value ?? '');
            }}
            onBlur={field.onBlur}
        />
    );
}
