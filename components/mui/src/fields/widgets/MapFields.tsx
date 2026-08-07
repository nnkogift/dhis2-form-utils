// fallow-ignore-file code-duplication
import { Box, FormHelperText, TextField } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import {
    CoordinateMapPicker,
    GeoJsonMapEditor,
    joinCoordinateValue,
    parseCoordinateValue,
    parseGeojsonGeometry,
    stringifyGeojsonGeometry,
} from '@nnkogift/dhis2-form-utils-map';
import '@nnkogift/dhis2-form-utils-map/style.css';
import { useEffect, useState } from 'react';

export function D2CoordinateField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const value = field.value as string;

    // Local text buffers, not derived directly from field.value on every render — a controlled
    // number input driven straight off `parseCoordinateValue(value)` rejects intermediate
    // keystrokes (e.g. typing "-" alone parses to NaN and gets silently dropped, so a user can
    // never type a negative number). These stay in sync with external value changes (map clicks,
    // RHF reset) via the effect below, but aren't clobbered by the widget's own in-progress typing.
    const [lngText, setLngText] = useState(() => parseCoordinateValue(value)?.lng.toString() ?? '');
    const [latText, setLatText] = useState(() => parseCoordinateValue(value)?.lat.toString() ?? '');

    useEffect(() => {
        const parsed = parseCoordinateValue(value);
        setLngText(parsed ? parsed.lng.toString() : '');
        setLatText(parsed ? parsed.lat.toString() : '');
    }, [value]);

    const commit = (lngRaw: string, latRaw: string) => {
        const lng = parseFloat(lngRaw);
        const lat = parseFloat(latRaw);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
            field.onChange(joinCoordinateValue(lng, lat));
        }
    };

    return (
        <Box sx={{ my: 2 }}>
            <FormHelperText>
                {fieldConfig.label}
                {isMandatory ? ' *' : ''}
            </FormHelperText>
            <CoordinateMapPicker value={value} onChange={field.onChange} disabled={isDisabled} />
            <TextField
                type="number"
                label="Longitude"
                value={lngText}
                disabled={isDisabled}
                onChange={(event) => {
                    const text = event.target.value;
                    setLngText(text);
                    commit(text, latText);
                }}
                onBlur={field.onBlur}
                fullWidth
                margin="normal"
            />
            <TextField
                type="number"
                label="Latitude"
                value={latText}
                disabled={isDisabled}
                onChange={(event) => {
                    const text = event.target.value;
                    setLatText(text);
                    commit(lngText, text);
                }}
                onBlur={field.onBlur}
                fullWidth
                margin="normal"
            />
            {hasError && validationText ? (
                <FormHelperText error>{validationText}</FormHelperText>
            ) : null}
        </Box>
    );
}

export function D2GeoJsonField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const value = field.value as string;
    const [textValue, setTextValue] = useState(value);
    const [textError, setTextError] = useState<string | undefined>(undefined);

    return (
        <Box sx={{ my: 2 }}>
            <FormHelperText>
                {fieldConfig.label}
                {isMandatory ? ' *' : ''}
            </FormHelperText>
            <GeoJsonMapEditor
                value={value}
                onChange={(next) => {
                    field.onChange(next);
                    const geometry = parseGeojsonGeometry(next);
                    setTextValue(geometry ? JSON.stringify(geometry, null, 2) : next);
                    setTextError(undefined);
                }}
                disabled={isDisabled}
            />
            <TextField
                label="Geometry (JSON)"
                value={textValue}
                disabled={isDisabled}
                error={Boolean(textError)}
                helperText={textError}
                multiline
                minRows={3}
                onChange={(event) => {
                    setTextValue(event.target.value);
                }}
                onBlur={() => {
                    if (!textValue) {
                        field.onChange('');
                        setTextError(undefined);
                        return;
                    }
                    const geometry = parseGeojsonGeometry(textValue);
                    if (geometry) {
                        field.onChange(stringifyGeojsonGeometry(geometry));
                        setTextError(undefined);
                    } else {
                        setTextError('Not a valid GeoJSON geometry');
                    }
                    field.onBlur();
                }}
                fullWidth
                margin="normal"
            />
            {hasError && validationText ? (
                <FormHelperText error>{validationText}</FormHelperText>
            ) : null}
        </Box>
    );
}
