// fallow-ignore-file code-duplication
import { Button, Group, Modal, Textarea } from '@mantine/core';
import {
    GeoJsonMapEditor,
    parseGeojsonGeometry,
    stringifyGeojsonGeometry,
} from '@nnkogift/dhis2-form-utils-map';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState } from 'react';

export type GeoJsonGeometryModalProps = {
    isOpen: boolean;
    /** Last committed value — reseeds the draft every time the modal opens. */
    value: string;
    label: string;
    disabled?: boolean;
    onCancel: () => void;
    onUpdate: (value: string) => void;
};

/** Owns the draft geometry while the editor is open — nothing here touches the RHF field. */
export function GeoJsonGeometryModal({
    isOpen,
    value,
    label,
    disabled,
    onCancel,
    onUpdate,
}: GeoJsonGeometryModalProps) {
    const [draft, setDraft] = useState(value);
    const [textValue, setTextValue] = useState(value);
    const [textError, setTextError] = useState<string | undefined>(undefined);

    // Reseed the draft from the committed value every time the modal opens, so a reopened modal
    // never shows edits (or a stale invalid-JSON error) left over from a previous cancelled
    // session.
    useEffect(() => {
        if (!isOpen) return;
        setDraft(value);
        setTextValue(value);
        setTextError(undefined);
    }, [isOpen, value]);

    return (
        <Modal opened={isOpen} onClose={onCancel} title={label}>
            <GeoJsonMapEditor
                value={draft}
                onChange={(next) => {
                    setDraft(next);
                    const geometry = parseGeojsonGeometry(next);
                    setTextValue(geometry ? JSON.stringify(geometry, null, 2) : next);
                    setTextError(undefined);
                }}
                disabled={disabled}
            />
            <Textarea
                label="Geometry (JSON)"
                value={textValue}
                disabled={disabled}
                error={textError}
                onChange={(event) => {
                    setTextValue(event.currentTarget.value);
                }}
                onBlur={() => {
                    if (!textValue) {
                        setDraft('');
                        setTextError(undefined);
                        return;
                    }
                    const geometry = parseGeojsonGeometry(textValue);
                    if (geometry) {
                        setDraft(stringifyGeojsonGeometry(geometry));
                        setTextError(undefined);
                    } else {
                        setTextError('Not a valid GeoJSON geometry');
                    }
                }}
            />
            <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    disabled={disabled || Boolean(textError)}
                    onClick={() => {
                        onUpdate(draft);
                    }}
                >
                    Update geometry
                </Button>
            </Group>
        </Modal>
    );
}
