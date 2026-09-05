// fallow-ignore-file code-duplication
import { Button, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui';
import {
    CoordinateMapPicker,
    joinCoordinateValue,
    parseCoordinateValue,
} from '@nnkogift/dhis2-form-utils-map';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState } from 'react';

export type CoordinateLocationModalProps = {
    isOpen: boolean;
    /** Last committed value — reseeds the draft every time the modal opens. */
    value: string;
    label: string;
    disabled?: boolean;
    onCancel: () => void;
    onUpdate: (value: string) => void;
};

/** Owns the draft coordinate while the picker is open — nothing here touches the RHF field. */
export function CoordinateLocationModal({
    isOpen,
    value,
    label,
    disabled,
    onCancel,
    onUpdate,
}: CoordinateLocationModalProps) {
    const [draft, setDraft] = useState(value);

    // Local text buffers, not derived directly from `draft` on every render — a controlled number
    // input driven straight off `parseCoordinateValue(draft)` rejects intermediate keystrokes
    // (e.g. typing "-" alone parses to NaN and gets silently dropped, so a user can never type a
    // negative number). Kept in sync with the draft via the effect below.
    const [lngText, setLngText] = useState(() => parseCoordinateValue(value)?.lng.toString() ?? '');
    const [latText, setLatText] = useState(() => parseCoordinateValue(value)?.lat.toString() ?? '');

    // Reseed the draft from the committed value every time the modal opens, so a reopened modal
    // never shows edits left over from a previous cancelled session.
    useEffect(() => {
        if (!isOpen) return;
        setDraft(value);
    }, [isOpen, value]);

    useEffect(() => {
        const parsed = parseCoordinateValue(draft);
        setLngText(parsed ? parsed.lng.toString() : '');
        setLatText(parsed ? parsed.lat.toString() : '');
    }, [draft]);

    const commit = (lngRaw: string, latRaw: string) => {
        const lng = parseFloat(lngRaw);
        const lat = parseFloat(latRaw);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
            setDraft(joinCoordinateValue(lng, lat));
        }
    };

    if (!isOpen) return null;

    return (
        <Modal onClose={onCancel}>
            <ModalTitle>{label}</ModalTitle>
            <ModalContent>
                <CoordinateMapPicker value={draft} onChange={setDraft} disabled={disabled} />
                <InputField
                    name="coordinate-modal-lng"
                    type="number"
                    label="Longitude"
                    value={lngText}
                    disabled={disabled}
                    onChange={({ value: next }) => {
                        const text = next ?? '';
                        setLngText(text);
                        commit(text, latText);
                    }}
                />
                <InputField
                    name="coordinate-modal-lat"
                    type="number"
                    label="Latitude"
                    value={latText}
                    disabled={disabled}
                    onChange={({ value: next }) => {
                        const text = next ?? '';
                        setLatText(text);
                        commit(lngText, text);
                    }}
                />
            </ModalContent>
            <ModalActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button
                    primary
                    disabled={disabled}
                    onClick={() => {
                        onUpdate(draft);
                    }}
                >
                    Update location
                </Button>
            </ModalActions>
        </Modal>
    );
}
