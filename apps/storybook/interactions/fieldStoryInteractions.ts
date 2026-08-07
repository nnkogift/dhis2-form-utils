import type { WidgetKind } from '@nnkogift/dhis2-form-utils-hooks';
import type { PlayFunction } from '@storybook/react';
import { expect, screen, userEvent, within } from 'storybook/test';
import type { FieldStoryArgs } from '../decorators/fieldStory';

export type FieldStoryAdapter = 'dhis2-ui' | 'mantine' | 'mui';

export const fieldLabelFor = (widgetKind: WidgetKind) => `${widgetKind} label`;

const labelPattern = (widgetKind: WidgetKind) => new RegExp(fieldLabelFor(widgetKind), 'i');

type Canvas = ReturnType<typeof within>;

function canvasOf(canvasElement: HTMLElement): Canvas {
    return within(canvasElement);
}

function queryTextInput(canvas: Canvas, widgetKind: WidgetKind) {
    return canvas.getByRole('textbox', { name: labelPattern(widgetKind) });
}

function queryNumericInput(canvas: Canvas, widgetKind: WidgetKind) {
    try {
        return canvas.getByRole('spinbutton', { name: labelPattern(widgetKind) });
    } catch {
        return queryTextInput(canvas, widgetKind);
    }
}

const NUMERIC_WIDGET_KINDS = new Set<WidgetKind>(['integer', 'number', 'percentage']);
const TEMPORAL_WIDGET_KINDS = new Set<WidgetKind>(['date', 'time', 'datetime', 'age']);

// fallow-ignore-next-line complexity
function queryTemporalInput(canvas: Canvas, widgetKind: WidgetKind) {
    const labeled = canvas.queryAllByLabelText(labelPattern(widgetKind));
    if (labeled[0]) return labeled[0];

    for (const role of ['textbox', 'combobox', 'group'] as const) {
        const matches = canvas.queryAllByRole(role, { name: labelPattern(widgetKind) });
        if (matches[0]) return matches[0];
    }

    // MUI X pickers sometimes expose the visible label as plain text only.
    const byText = canvas.queryByText(labelPattern(widgetKind));
    if (!byText) {
        throw new Error(`Unable to locate input for widgetKind=${widgetKind}`);
    }

    const container = byText.closest('.MuiFormControl-root') ?? byText.parentElement;
    const input = container?.querySelector('input');
    if (!input) {
        throw new Error(`Unable to locate input for widgetKind=${widgetKind}`);
    }
    return input;
}

function queryFieldInput(canvas: Canvas, widgetKind: WidgetKind) {
    if (NUMERIC_WIDGET_KINDS.has(widgetKind)) {
        return queryNumericInput(canvas, widgetKind);
    }
    if (TEMPORAL_WIDGET_KINDS.has(widgetKind)) {
        return queryTemporalInput(canvas, widgetKind);
    }
    return queryTextInput(canvas, widgetKind);
}

async function assertInputValue(input: HTMLElement, value: string) {
    if (input instanceof HTMLInputElement && input.type === 'number') {
        await expect(input).toHaveValue(Number(value));
        return;
    }
    await expect(input).toHaveValue(value);
}

async function typeIntoField(canvasElement: HTMLElement, widgetKind: WidgetKind, value: string) {
    const canvas = canvasOf(canvasElement);
    const input = queryFieldInput(canvas, widgetKind);
    await userEvent.clear(input);
    await userEvent.type(input, value);
    await assertInputValue(input, value);
}

function getByDataTest(canvasElement: HTMLElement, testId: string): HTMLElement {
    const element = canvasElement.querySelector(`[data-test="${testId}"]`);
    if (!element) {
        throw new Error(`Element with data-test="${testId}" not found`);
    }
    return element as HTMLElement;
}

async function openDhis2SingleSelect(canvasElement: HTMLElement) {
    const field = getByDataTest(canvasElement, 'dhis2-uiwidgets-singleselectfield');
    const trigger = field.querySelector('[data-test="dhis2-uicore-select-input"]');
    if (!trigger) throw new Error('DHIS2 single select trigger not found');
    await userEvent.click(trigger);
}

async function openDhis2MultiSelect(canvasElement: HTMLElement) {
    const field = getByDataTest(canvasElement, 'dhis2-uiwidgets-multiselectfield');
    const trigger = field.querySelector('[data-test="dhis2-uicore-select-input"]');
    if (!trigger) throw new Error('DHIS2 multi select trigger not found');
    await userEvent.click(trigger);
}

async function pickSelectOption(
    adapter: FieldStoryAdapter,
    canvasElement: HTMLElement,
    widgetKind: WidgetKind,
    optionLabel: string
) {
    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        await openDhis2SingleSelect(canvasElement);
        await userEvent.click(await screen.findByText(optionLabel));
        await expect(screen.getByText(optionLabel)).toBeInTheDocument();
        return;
    }

    if (adapter === 'mantine') {
        await userEvent.click(canvas.getByRole('textbox', { name: labelPattern(widgetKind) }));
        await userEvent.click(await screen.findByRole('option', { name: optionLabel }));
        return;
    }

    await userEvent.click(canvas.getByRole('combobox', { name: labelPattern(widgetKind) }));
    await userEvent.click(await screen.findByRole('option', { name: optionLabel }));
}

// fallow-ignore-next-line complexity
async function pickMultiSelectOption(
    adapter: FieldStoryAdapter,
    canvasElement: HTMLElement,
    widgetKind: WidgetKind,
    optionLabel: string
) {
    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        await openDhis2MultiSelect(canvasElement);
        const option = await screen.findByText(optionLabel);
        await userEvent.click(option);
        await expect(
            getByDataTest(canvasElement, 'dhis2-uiwidgets-multiselectfield')
        ).toBeInTheDocument();
        return;
    }

    if (adapter === 'mantine') {
        const input = canvas.getByRole('textbox', { name: labelPattern(widgetKind) });
        const target = input.closest('.mantine-MultiSelect-input') ?? input.parentElement ?? input;
        await userEvent.click(target);
        await expect(await screen.findByRole('option', { name: optionLabel })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('option', { name: optionLabel }));
        return;
    }

    await userEvent.click(canvas.getByRole('combobox', { name: labelPattern(widgetKind) }));
    await userEvent.click(await screen.findByRole('option', { name: optionLabel }));
}

async function pickBooleanYes(
    _adapter: FieldStoryAdapter,
    canvasElement: HTMLElement,
    _widgetKind: WidgetKind = 'boolean'
) {
    const canvas = canvasOf(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Yes' }));
}

export function fieldStoryPlays(adapter: FieldStoryAdapter) {
    const textInput =
        (widgetKind: WidgetKind = 'text', value = 'Hello DHIS2'): PlayFunction<FieldStoryArgs> =>
        async ({ canvasElement }) => {
            await typeIntoField(canvasElement, widgetKind, value);
        };

    const showsRequired: PlayFunction<FieldStoryArgs> = async ({ canvasElement, args }) => {
        const widgetKind = args?.widgetKind ?? 'text';
        const canvas = canvasOf(canvasElement);

        if (adapter === 'dhis2-ui') {
            await expect(
                getByDataTest(canvasElement, 'dhis2-uiwidgets-inputfield-label-required')
            ).toBeInTheDocument();
            return;
        }

        const input = queryFieldInput(canvas, widgetKind);
        await expect(input).toBeRequired();
    };

    const showsWarning =
        (message = 'Please verify this value'): PlayFunction<FieldStoryArgs> =>
        async ({ canvasElement, args }) => {
            const widgetKind = args?.widgetKind ?? 'text';
            const canvas = canvasOf(canvasElement);

            if (adapter === 'dhis2-ui') {
                await expect(canvas.getByText(message)).toBeInTheDocument();
                return;
            }

            // Mantine/MUI adapters do not yet surface rule warnings in the widget UI.
            await expect(queryFieldInput(canvas, widgetKind)).toBeInTheDocument();
            await expect(canvas.queryByText(message)).not.toBeInTheDocument();
        };

    const showsError =
        (message = 'Invalid value'): PlayFunction<FieldStoryArgs> =>
        async ({ canvasElement }) => {
            const canvas = canvasOf(canvasElement);
            await expect(canvas.getByText(message)).toBeInTheDocument();
        };

    const fieldHidden: PlayFunction<FieldStoryArgs> = async ({ canvasElement, args }) => {
        const widgetKind = args?.widgetKind ?? 'text';
        const canvas = canvasOf(canvasElement);
        await expect(
            canvas.queryByRole('textbox', { name: labelPattern(widgetKind) })
        ).not.toBeInTheDocument();
        await expect(canvas.queryByLabelText(labelPattern(widgetKind))).not.toBeInTheDocument();
    };

    const generatedFieldDisabled: PlayFunction = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const input = canvas.getByDisplayValue('generated-value');
        await expect(input).toBeDisabled();
    };

    const integerInput: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        await typeIntoField(canvasElement, 'integer', '42');
    };

    const selectOption: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        await pickSelectOption(adapter, canvasElement, 'select', 'Option A');
    };

    const multiSelectOption: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        await pickMultiSelectOption(adapter, canvasElement, 'multiSelect', 'Option A');
    };

    const booleanYes: PlayFunction<FieldStoryArgs> = async ({ canvasElement, args }) => {
        await pickBooleanYes(adapter, canvasElement, args?.widgetKind ?? 'boolean');
    };

    const dateInput: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const input = queryFieldInput(canvas, 'date');
        await expect(input).toBeInTheDocument();
        if (input instanceof HTMLInputElement && !input.readOnly) {
            await userEvent.clear(input);
            await userEvent.type(input, '2024-06-15');
            await assertInputValue(input, '2024-06-15');
        }
    };

    const timeInput: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const input = queryFieldInput(canvas, 'time');
        await expect(input).toBeInTheDocument();
        if (input instanceof HTMLInputElement && !input.readOnly) {
            await userEvent.clear(input);
            await userEvent.type(input, '14:30');
            await assertInputValue(input, '14:30');
        }
    };

    const datetimeInput: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const matches = canvas.queryAllByLabelText(labelPattern('datetime'));
        await expect(matches.length).toBeGreaterThan(0);
    };

    const ageShowsComputedAge: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByText(/Age: \d+ years/)).toBeInTheDocument();
    };

    // Coordinate/GeoJson map canvas interactions (WebGL hit-testing) are unreliable in headless
    // browsers, so these plays exercise the accessible numeric-input / textarea fallback paths
    // instead — which also matches how a screen-reader user would use these widgets. Both widgets
    // derive their inputs' displayed `value` from the RHF field value (not local state), so
    // re-reading an input after editing a sibling input verifies the round trip through
    // `field.onChange`, not just an uncontrolled DOM value.
    // dhis2-ui's InputField doesn't wire <label for>/aria-labelledby to its <input>, so
    // getByLabelText fails there; Mantine's NumberInput renders type="text"/inputmode="numeric"
    // (role "textbox", not "spinbutton"), so getByRole('spinbutton') fails there. Try both.
    function queryCoordinateInput(canvas: Canvas, labelText: RegExp): HTMLElement {
        try {
            return canvas.getByRole('spinbutton', { name: labelText });
        } catch {
            try {
                return canvas.getByLabelText(labelText);
            } catch {
                return canvas.getByRole('textbox', { name: labelText });
            }
        }
    }

    const coordinateInput: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const lng = queryCoordinateInput(canvas, /Longitude/i);
        const lat = queryCoordinateInput(canvas, /Latitude/i);

        await userEvent.clear(lng);
        await userEvent.type(lng, '35.703');
        await assertInputValue(lng, '35.703');

        await userEvent.clear(lat);
        await userEvent.type(lat, '-5.639');
        await assertInputValue(lat, '-5.639');

        // Re-query: proves longitude survived the latitude edit via field.value, not local state.
        await assertInputValue(queryCoordinateInput(canvas, /Longitude/i), '35.703');
    };

    const geojsonDraw: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const textarea = canvas.getByRole('textbox', { name: /Geometry \(JSON\)/i });
        await userEvent.clear(textarea);
        // userEvent.type() parses `{`/`}` as its keyboard DSL (e.g. "{enter}"), so paste the
        // literal JSON instead of typing it character by character.
        await userEvent.click(textarea);
        await userEvent.paste('{"type":"Point","coordinates":[10.9,59.8]}');
        await userEvent.tab();
        await expect(canvas.queryByText(/Not a valid GeoJSON geometry/i)).not.toBeInTheDocument();
    };

    const orgUnitSelect: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);

        if (adapter === 'dhis2-ui') {
            // OrganisationUnitTree does two sequential fetches (root list, then the root's own
            // node data) before rendering "Bo District" — longer than the default 1s timeout.
            const node = await screen.findByText('Bo District', {}, { timeout: 5000 });
            await userEvent.click(node);
            await expect(
                await screen.findByText(/Selected: Bo District/i, {}, { timeout: 5000 })
            ).toBeInTheDocument();
            return;
        }

        const control =
            adapter === 'mantine'
                ? canvas.getByRole('textbox', { name: labelPattern('orgUnit') })
                : canvas.getByRole('combobox', { name: labelPattern('orgUnit') });
        await userEvent.click(control);
        const option = await screen.findByText(/Bo District/i);
        await userEvent.click(option);
        await expect((control as HTMLInputElement).value).toContain('Bo District');
    };

    const fileUpload =
        (widgetKind: 'file' | 'image' = 'file'): PlayFunction<FieldStoryArgs> =>
        async ({ canvasElement }) => {
            const canvas = canvasOf(canvasElement);
            const input = canvasElement.querySelector('input[type="file"]');
            if (!input) throw new Error('File input not found');
            const file = new File(['fixture'], 'fixture.png', { type: 'image/png' });
            await userEvent.upload(input as HTMLInputElement, file);

            if (widgetKind === 'image') {
                // D2ImageField renders <img src=".../fileResources/{id}/data"> only once
                // `field.value` (the uploaded UUID) is non-empty — this is the observable
                // proof the upload → field.onChange round trip succeeded.
                await expect(await screen.findByRole('img')).toHaveAttribute(
                    'src',
                    expect.stringContaining('fixture-uuid-0000-0000-000000000000')
                );
                return;
            }

            await expect(canvas.queryByText(/Upload failed/i)).not.toBeInTheDocument();
        };

    return {
        textInput,
        showsRequired,
        showsWarning,
        showsError,
        fieldHidden,
        generatedFieldDisabled,
        integerInput,
        selectOption,
        multiSelectOption,
        booleanYes,
        dateInput,
        timeInput,
        datetimeInput,
        ageShowsComputedAge,
        coordinateInput,
        geojsonDraw,
        orgUnitSelect,
        fileUpload,
    };
}
