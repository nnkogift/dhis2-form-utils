import { Autocomplete, TextField } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    resolveFieldValidation,
    useOrgUnitPickerContext,
    useOrganisationUnitsQuery,
} from '@nnkogift/dhis2-form-utils-hooks';

type OrgUnitOption = { id: string; label: string };

/**
 * v1 scope reduction: MUI has no org-unit tree primitive, so this renders a
 * flat searchable Autocomplete over the fetched org units (ancestor path
 * shown as secondary text) rather than a hierarchical tree. A real tree
 * widget is a fast-follow, not part of this slice.
 */
export function D2OrgUnitField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const pickerContext = useOrgUnitPickerContext();
    const { organisationUnits, loading } = useOrganisationUnitsQuery(pickerContext?.roots);

    const options: OrgUnitOption[] = organisationUnits.map((ou) => ({
        id: ou.id,
        label:
            ou.ancestors.length > 0
                ? `${ou.displayName} (${ou.ancestors.map((ancestor) => ancestor.displayName).join(' / ')})`
                : ou.displayName,
    }));
    const value = options.find((option) => option.id === field.value) ?? null;

    return (
        <Autocomplete
            options={options}
            loading={loading}
            disabled={isDisabled}
            value={value}
            isOptionEqualToValue={(option, selected) => option.id === selected.id}
            onChange={(_event, selected) => {
                field.onChange(selected?.id ?? '');
            }}
            onBlur={field.onBlur}
            renderInput={(params) => (
                <TextField
                    {...params}
                    name={field.name}
                    label={fieldConfig.label}
                    helperText={hasError ? validationText : fieldConfig.description}
                    required={isMandatory}
                    error={hasError}
                    fullWidth
                    margin="normal"
                />
            )}
        />
    );
}
