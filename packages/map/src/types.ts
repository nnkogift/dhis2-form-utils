import type { StyleSpecification } from 'maplibre-gl';

export type MapPickerProps = {
    /** DHIS2-wire-format string value (empty string = no value yet). */
    value: string;
    onChange: (value: string) => void;
    /** Overrides `defaultMapStyle`. Accepts a full style object or a style URL. */
    mapStyle?: StyleSpecification | string;
    disabled?: boolean;
    className?: string;
};
