import { Button, OrganisationUnitTree } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import {
    resolveFieldValidation,
    useOrgUnitPickerContext,
    useOrganisationUnitsQuery,
} from '@nnkogift/dhis2-form-utils-hooks';

// fallow-ignore-next-line complexity
export function D2OrgUnitField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const pickerContext = useOrgUnitPickerContext();
    const { organisationUnits, roots, loading, error } = useOrganisationUnitsQuery(
        pickerContext?.roots
    );

    const value = field.value as string;
    const selectedUnit = organisationUnits.find((ou) => ou.id === value);
    const selectedLabel = selectedUnit?.displayName ?? value;

    return (
        <fieldset>
            <legend>
                {fieldConfig.label}
                {isMandatory ? ' *' : ''}
            </legend>
            {fieldConfig.description ? <p>{fieldConfig.description}</p> : null}
            {selectedLabel ? (
                <p>
                    Selected: {selectedLabel}{' '}
                    <Button
                        small
                        disabled={isDisabled}
                        onClick={() => {
                            field.onChange('');
                        }}
                    >
                        Clear
                    </Button>
                </p>
            ) : null}
            {roots.length > 0 ? (
                <OrganisationUnitTree
                    roots={roots}
                    singleSelection
                    disableSelection={isDisabled}
                    initiallyExpanded={roots.map((id) => `/${id}`)}
                    onChange={({ id }) => {
                        field.onChange(id);
                    }}
                />
            ) : loading ? (
                <p>Loading organisation units…</p>
            ) : error ? (
                <p>Failed to load organisation units.</p>
            ) : null}
            {validationText ? (
                <p data-error={hasError || undefined} data-warning={hasWarning || undefined}>
                    {validationText}
                </p>
            ) : null}
        </fieldset>
    );
}
