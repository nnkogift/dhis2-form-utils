import type { WidgetKind } from '@dhis2-form-utils/hooks';
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

function queryFieldInput(canvas: Canvas, widgetKind: WidgetKind) {
    if (widgetKind === 'integer' || widgetKind === 'number' || widgetKind === 'percentage') {
        return queryNumericInput(canvas, widgetKind);
    }
    if (widgetKind === 'date' || widgetKind === 'time' || widgetKind === 'age') {
        try {
            return canvas.getByLabelText(labelPattern(widgetKind));
        } catch {
            return queryTextInput(canvas, widgetKind);
        }
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

async function clickMantineBooleanSegment(control: HTMLElement, optionLabel: 'Yes' | 'No') {
    await userEvent.click(within(control).getByText(optionLabel));
    const value = optionLabel === 'Yes' ? 'true' : 'false';
    const input = control.querySelector(`input[type="radio"][value="${value}"]`);
    if (input instanceof HTMLInputElement && !input.checked) {
        input.click();
    }
}

async function pickBooleanYes(
    adapter: FieldStoryAdapter,
    canvasElement: HTMLElement,
    widgetKind: WidgetKind = 'boolean'
) {
    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        await openDhis2SingleSelect(canvasElement);
        await userEvent.click(await screen.findByText('Yes'));
        return;
    }

    if (adapter === 'mantine') {
        const control = canvas.getByLabelText(labelPattern(widgetKind));
        await clickMantineBooleanSegment(control, 'Yes');
        return;
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Yes' }));
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

    const booleanYes: PlayFunction<FieldStoryArgs> = async ({ canvasElement, args }) => {
        await pickBooleanYes(adapter, canvasElement, args?.widgetKind ?? 'boolean');
    };

    const dateInput: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        await typeIntoField(canvasElement, 'date', '2024-06-15');
    };

    const ageShowsComputedAge: PlayFunction<FieldStoryArgs> = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByText(/Age: \d+ years/)).toBeInTheDocument();
    };

    const stubWidget =
        (widgetKind: WidgetKind): PlayFunction<FieldStoryArgs> =>
        async ({ canvasElement }) => {
            const canvas = canvasOf(canvasElement);
            await expect(
                canvas.getByText(new RegExp(`Widget not yet implemented: ${widgetKind}`))
            ).toBeInTheDocument();
            await expect(queryFieldInput(canvas, widgetKind)).toBeDisabled();
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
        booleanYes,
        dateInput,
        ageShowsComputedAge,
        stubWidget,
    };
}
