import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS, RULE_EFFECT_WAIT_TIMEOUT_MS } from './waitTimeouts';

export type EventProgramRulesAdapter = 'dhis2-ui' | 'mantine' | 'mui';

export type StoryPlayContext = {
    canvasElement: HTMLElement;
};

type StoryPlay = (context: StoryPlayContext) => Promise<void>;

const TOGGLE_HIDE_FIELD_LABEL = /^Toggle hide field$/i;
const TOGGLE_HIDE_SECTION_LABEL = /^Toggle hide section$/i;
const NUMBER_LABEL = /^Number input$/i;
const TRIGGER_TEXT_LABEL = /^Trigger text$/i;
const COLOUR_LABEL = /^Colour$/i;
const HIDE_TARGET_LABEL = /^Hide target field$/i;
const ASSIGNED_VALUE_LABEL = /Assigned value/i;
// No trailing `$` anchor: dhis2-ui appends an unspaced "*" to the label text once
// SETMANDATORYFIELD makes the field required (e.g. "Mandatory target*").
const MANDATORY_TARGET_LABEL = /^Mandatory target/i;
const HIDEABLE_SECTION_FIELD_LABEL = /^Hideable section field A$/i;

const NUMBER_EXCEEDS_WARNING = /Number exceeds 100/i;
const NUMBER_NEGATIVE_ERROR = /Number cannot be negative/i;

type Canvas = ReturnType<typeof within>;

function canvasOf(canvasElement: HTMLElement): Canvas {
    return within(canvasElement);
}

// FormFeedback repeats each message's text (once as a title, once inline in the body), so a
// plain `getByText` on a fragment of it is ambiguous — match against any element whose text
// content satisfies every pattern instead of asserting on a single unique node.
function findFeedbackText(canvasElement: HTMLElement, patterns: RegExp[]): boolean {
    return (
        within(canvasElement).queryAllByText((_content, element) => {
            const text = element?.textContent ?? '';
            return patterns.every((pattern) => pattern.test(text));
        }).length > 0
    );
}

function queryNumberInput(canvas: Canvas) {
    try {
        return canvas.getByRole('spinbutton', { name: NUMBER_LABEL });
    } catch {
        return canvas.getByRole('textbox', { name: NUMBER_LABEL });
    }
}

async function typeNumber(canvasElement: HTMLElement, value: string) {
    const canvas = canvasOf(canvasElement);
    const input = queryNumberInput(canvas);
    await userEvent.clear(input);
    await userEvent.type(input, value);
}

async function typeTriggerText(canvasElement: HTMLElement, value: string) {
    const canvas = canvasOf(canvasElement);
    const input = canvas.getByLabelText(TRIGGER_TEXT_LABEL);
    await userEvent.clear(input);
    if (value) {
        await userEvent.type(input, value);
    }
}

const MANTINE_BOOLEAN_SEGMENT_VALUE: Record<'Yes' | 'No', string> = {
    Yes: 'true',
    No: 'false',
};

async function clickMantineBooleanSegment(control: HTMLElement, optionLabel: 'Yes' | 'No') {
    await userEvent.click(within(control).getByText(optionLabel));
    const input = control.querySelector(
        `input[type="radio"][value="${MANTINE_BOOLEAN_SEGMENT_VALUE[optionLabel]}"]`
    );
    if (input instanceof HTMLInputElement && !input.checked) {
        input.click();
    }
}

// Branches dispatch on the 3 UI adapters' distinct boolean-widget DOM shapes.
// fallow-ignore-next-line complexity
async function pickBooleanOption(
    adapter: EventProgramRulesAdapter,
    canvasElement: HTMLElement,
    fieldLabel: RegExp,
    optionLabel: 'Yes' | 'No'
) {
    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        const field = Array.from(
            canvasElement.querySelectorAll('[data-test="dhis2-uiwidgets-singleselectfield"]')
        ).find((element) => fieldLabel.test(element.textContent ?? ''));
        if (!field) {
            throw new Error(`DHIS2 boolean field matching ${fieldLabel} not found`);
        }
        const trigger = field.querySelector('[data-test="dhis2-uicore-select-input"]');
        if (!trigger) throw new Error('DHIS2 single select trigger not found');
        await userEvent.click(trigger);
        await userEvent.click(await screen.findByText(optionLabel));
        return;
    }

    if (adapter === 'mantine') {
        const control = canvas.getByLabelText(fieldLabel);
        await clickMantineBooleanSegment(control, optionLabel);
        return;
    }

    const group = canvas.getByRole('group', { name: fieldLabel });
    await userEvent.click(within(group).getByRole('button', { name: optionLabel }));
}

function isColourMenuOpen(adapter: EventProgramRulesAdapter): boolean {
    if (adapter === 'dhis2-ui') {
        return Boolean(
            document.querySelector('[data-test="dhis2-uicore-select-menu-menuwrapper"]')
        );
    }
    return Boolean(document.querySelector('[role="listbox"]'));
}

// Idempotent: a `waitFor` callback can retry this several times, and re-clicking a select
// trigger while its menu is already open would toggle it closed instead of keeping it open.
// Branches beyond that dispatch on the 3 UI adapters' distinct select-widget DOM shapes.
// fallow-ignore-next-line complexity
async function openColourOptions(adapter: EventProgramRulesAdapter, canvasElement: HTMLElement) {
    if (isColourMenuOpen(adapter)) {
        return;
    }

    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        const field = Array.from(
            canvasElement.querySelectorAll('[data-test="dhis2-uiwidgets-singleselectfield"]')
        ).find((element) => COLOUR_LABEL.test(element.textContent ?? ''));
        if (!field) {
            throw new Error('DHIS2 Colour select field not found');
        }
        const trigger = field.querySelector('[data-test="dhis2-uicore-select-input"]');
        if (!trigger) throw new Error('DHIS2 single select trigger not found');
        await userEvent.click(trigger);
        return;
    }

    if (adapter === 'mantine') {
        await userEvent.click(canvas.getByRole('textbox', { name: COLOUR_LABEL }));
        return;
    }

    await userEvent.click(canvas.getByRole('combobox', { name: COLOUR_LABEL }));
}

async function closeColourOptions() {
    await userEvent.keyboard('{Escape}');
}

export function eventProgramRulesPlays(adapter: EventProgramRulesAdapter) {
    const rendersForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByRole('button', { name: /save/i })).toBeInTheDocument();
        await expect(queryNumberInput(canvas)).toBeInTheDocument();
        await expect(canvas.getByLabelText(TRIGGER_TEXT_LABEL)).toBeInTheDocument();
    };

    const fillsNumber: StoryPlay = async ({ canvasElement }) => {
        await typeNumber(canvasElement, '12');
        const canvas = canvasOf(canvasElement);
        const input = queryNumberInput(canvas);
        if (input instanceof HTMLInputElement && input.type === 'number') {
            await expect(input).toHaveValue(12);
            return;
        }
        await expect(input).toHaveValue('12');
    };

    const hideFieldWhenToggleOn: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByLabelText(HIDE_TARGET_LABEL)).toBeInTheDocument();

        await pickBooleanOption(adapter, canvasElement, TOGGLE_HIDE_FIELD_LABEL, 'Yes');

        await waitFor(
            async () => {
                await expect(canvas.queryByLabelText(HIDE_TARGET_LABEL)).not.toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const hideSectionWhenToggleOn: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByLabelText(HIDEABLE_SECTION_FIELD_LABEL)).toBeInTheDocument();

        await pickBooleanOption(adapter, canvasElement, TOGGLE_HIDE_SECTION_LABEL, 'Yes');

        await waitFor(
            async () => {
                await expect(
                    canvas.queryByLabelText(HIDEABLE_SECTION_FIELD_LABEL)
                ).not.toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
        );
    };

    const showWarningAboveHundred: StoryPlay = async ({ canvasElement }) => {
        await typeNumber(canvasElement, '150');
        const canvas = canvasOf(canvasElement);

        if (adapter === 'dhis2-ui') {
            await waitFor(
                async () => {
                    await expect(canvas.getByText(NUMBER_EXCEEDS_WARNING)).toBeInTheDocument();
                },
                { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
            );
            return;
        }

        await waitFor(
            async () => {
                const input = queryNumberInput(canvas);
                if (input instanceof HTMLInputElement && input.type === 'number') {
                    await expect(input).toHaveValue(150);
                } else {
                    await expect(input).toHaveValue('150');
                }
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const showErrorBelowZero: StoryPlay = async ({ canvasElement }) => {
        await typeNumber(canvasElement, '-5');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                await expect(canvas.getByText(NUMBER_NEGATIVE_ERROR)).toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const assignDoublesNumber: StoryPlay = async ({ canvasElement }) => {
        await typeNumber(canvasElement, '21');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                const assigned = (() => {
                    try {
                        return canvas.getByRole('spinbutton', { name: ASSIGNED_VALUE_LABEL });
                    } catch {
                        return canvas.getByRole('textbox', { name: ASSIGNED_VALUE_LABEL });
                    }
                })();
                if (assigned instanceof HTMLInputElement && assigned.type === 'number') {
                    await expect(assigned).toHaveValue(42);
                } else {
                    await expect(assigned).toHaveValue('42');
                }
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const mandatoryTargetViaTriggerText: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const mandatoryTarget = canvas.getByLabelText(MANDATORY_TARGET_LABEL);
        await expect(mandatoryTarget).not.toBeRequired();

        await typeTriggerText(canvasElement, 'mandatory');

        if (adapter === 'dhis2-ui') {
            // dhis2-ui's InputField only renders a visual "*" marker next to the label; it never
            // sets a native `required`/`aria-required` attribute on the input itself.
            await waitFor(
                async () => {
                    await expect(
                        canvasElement.querySelector(
                            '[data-test="dhis2-uiwidgets-inputfield-label-required"]'
                        )
                    ).toBeInTheDocument();
                },
                { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
            );
            return;
        }

        await waitFor(
            async () => {
                await expect(canvas.getByLabelText(MANDATORY_TARGET_LABEL)).toBeRequired();
            },
            { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
        );
    };

    // The Colour dropdown stays open while other fields are edited (it only closes on Escape or
    // an outside click of its own trigger), so these plays open it once, edit the trigger-text
    // field that drives the rule while it stays open, and poll the already-open option list —
    // re-clicking the trigger on every `waitFor` retry would toggle the menu closed instead.
    const hideOptionRedViaTriggerText: StoryPlay = async ({ canvasElement }) => {
        await openColourOptions(adapter, canvasElement);
        await expect(screen.getByText('Red')).toBeInTheDocument();

        await typeTriggerText(canvasElement, 'hidered');

        await waitFor(
            async () => {
                await expect(screen.queryByText('Red')).not.toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
        await expect(screen.getByText('Green')).toBeInTheDocument();
        await closeColourOptions();
    };

    const optionGroupVisibilityViaTriggerText: StoryPlay = async ({ canvasElement }) => {
        await openColourOptions(adapter, canvasElement);

        await typeTriggerText(canvasElement, 'hidewarm');

        await waitFor(
            async () => {
                await expect(screen.queryByText('Yellow')).not.toBeInTheDocument();
                await expect(screen.queryByText('Red')).not.toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
        await expect(screen.getByText('Blue')).toBeInTheDocument();

        await typeTriggerText(canvasElement, 'showwarm');

        await waitFor(
            async () => {
                await expect(screen.getByText('Yellow')).toBeInTheDocument();
                await expect(screen.getByText('Red')).toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
        await closeColourOptions();
    };

    const feedbackAndIndicators: StoryPlay = async ({ canvasElement }) => {
        await typeTriggerText(canvasElement, 'storybook-demo');
        await typeNumber(canvasElement, '5');

        await waitFor(
            async () => {
                await expect(
                    findFeedbackText(canvasElement, [/Trigger text is/i, /storybook-demo/i])
                ).toBe(true);
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );

        await waitFor(
            async () => {
                await expect(
                    findFeedbackText(canvasElement, [/Calculated double/i, /\b10\b/])
                ).toBe(true);
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const submitForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await typeNumber(canvasElement, '4');
        await userEvent.click(canvas.getByRole('button', { name: /save/i }));
    };

    return {
        rendersForm,
        fillsNumber,
        hideFieldWhenToggleOn,
        hideSectionWhenToggleOn,
        showWarningAboveHundred,
        showErrorBelowZero,
        assignDoublesNumber,
        mandatoryTargetViaTriggerText,
        hideOptionRedViaTriggerText,
        optionGroupVisibilityViaTriggerText,
        feedbackAndIndicators,
        submitForm,
    };
}
