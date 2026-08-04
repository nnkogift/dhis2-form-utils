import { expect, userEvent, waitFor, within } from 'storybook/test';
import { RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS, RULE_EFFECT_WAIT_TIMEOUT_MS } from './waitTimeouts';

export type AncAdapter = 'dhis2-ui' | 'mantine' | 'mui';

export type StoryPlayContext = {
    canvasElement: HTMLElement;
};

export type StoryPlay = (context: StoryPlayContext) => Promise<void>;

const SMOKING_LABEL = /^WHOMCH Smoking$/i;
const COUNSELLING_LABEL = /Smoking cessation counselling/i;
const HEMOGLOBIN_LABEL = /WHOMCH Hemoglobin value/i;

const LOW_HEMOGLOBIN_WARNING = /Hemoglobin value lower than normal/i;
const HIGH_HEMOGLOBIN_ERROR = /The hemoglobin value cannot be above 99/i;

type Canvas = ReturnType<typeof within>;

function canvasOf(canvasElement: HTMLElement): Canvas {
    return within(canvasElement);
}

function queryHemoglobinInput(canvas: Canvas) {
    try {
        return canvas.getByRole('spinbutton', { name: HEMOGLOBIN_LABEL });
    } catch {
        return canvas.getByRole('textbox', { name: HEMOGLOBIN_LABEL });
    }
}

async function typeHemoglobin(canvasElement: HTMLElement, value: string) {
    const canvas = canvasOf(canvasElement);
    const input = queryHemoglobinInput(canvas);
    await userEvent.clear(input);
    await userEvent.type(input, value);
}

async function pickBooleanOption(
    adapter: AncAdapter,
    canvasElement: HTMLElement,
    fieldLabel: RegExp,
    optionLabel: 'Yes' | 'No'
) {
    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        const fieldsets = Array.from(canvasElement.querySelectorAll('fieldset')).filter(
            (element) => {
                const text = element.textContent ?? '';
                if (fieldLabel === SMOKING_LABEL) {
                    return /WHOMCH Smoking/i.test(text) && !/counselling/i.test(text);
                }
                return fieldLabel.test(text);
            }
        );
        const field = fieldsets[0];
        if (!field) {
            throw new Error(`DHIS2 boolean field matching ${fieldLabel} not found`);
        }
        await userEvent.click(within(field).getByRole('radio', { name: optionLabel }));
        return;
    }

    if (adapter === 'mantine') {
        const control = canvas.getByRole('radiogroup', { name: fieldLabel });
        await userEvent.click(within(control).getByRole('radio', { name: optionLabel }));
        return;
    }

    const group = canvas.getByRole('group', { name: fieldLabel });
    await userEvent.click(within(group).getByRole('radio', { name: optionLabel }));
}

export function ancPlays(adapter: AncAdapter) {
    const rendersForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByRole('button', { name: /save/i })).toBeInTheDocument();
        await expect(queryHemoglobinInput(canvas)).toBeInTheDocument();

        if (adapter === 'dhis2-ui') {
            await expect(
                canvas.getByRole('radio', { name: 'Yes', hidden: false })
            ).toBeInTheDocument();
            return;
        }

        if (adapter === 'mantine') {
            await expect(
                canvas.getByRole('radiogroup', { name: SMOKING_LABEL })
            ).toBeInTheDocument();
            await expect(
                canvas.queryByRole('radiogroup', { name: COUNSELLING_LABEL })
            ).not.toBeInTheDocument();
            return;
        }

        await expect(canvas.getByRole('group', { name: SMOKING_LABEL })).toBeInTheDocument();
        await expect(
            canvas.queryByRole('group', { name: COUNSELLING_LABEL })
        ).not.toBeInTheDocument();
    };

    const fillsHemoglobin: StoryPlay = async ({ canvasElement }) => {
        await typeHemoglobin(canvasElement, '12');
        const canvas = canvasOf(canvasElement);
        const input = queryHemoglobinInput(canvas);
        if (input instanceof HTMLInputElement && input.type === 'number') {
            await expect(input).toHaveValue(12);
            return;
        }
        await expect(input).toHaveValue('12');
    };

    const lowHemoglobinWarning: StoryPlay = async ({ canvasElement }) => {
        await typeHemoglobin(canvasElement, '8');
        const canvas = canvasOf(canvasElement);

        if (adapter === 'dhis2-ui') {
            await waitFor(
                async () => {
                    await expect(canvas.getByText(LOW_HEMOGLOBIN_WARNING)).toBeInTheDocument();
                },
                { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
            );
            return;
        }

        await waitFor(
            async () => {
                const input = queryHemoglobinInput(canvas);
                if (input instanceof HTMLInputElement && input.type === 'number') {
                    await expect(input).toHaveValue(8);
                } else {
                    await expect(input).toHaveValue('8');
                }
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
        await expect(canvas.queryByText(LOW_HEMOGLOBIN_WARNING)).not.toBeInTheDocument();
    };

    const highHemoglobinError: StoryPlay = async ({ canvasElement }) => {
        await typeHemoglobin(canvasElement, '100');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                await expect(canvas.getByText(HIGH_HEMOGLOBIN_ERROR)).toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const nonSmokerHidesCounselling: StoryPlay = async ({ canvasElement }) => {
        await pickBooleanOption(adapter, canvasElement, SMOKING_LABEL, 'Yes');

        if (adapter === 'dhis2-ui') {
            await waitFor(async () => {
                await expect(
                    canvasOf(canvasElement).getByText(COUNSELLING_LABEL)
                ).toBeInTheDocument();
            });
        } else if (adapter === 'mantine') {
            await waitFor(async () => {
                await expect(
                    canvasOf(canvasElement).getByRole('radiogroup', { name: COUNSELLING_LABEL })
                ).toBeInTheDocument();
            });
        } else {
            await waitFor(async () => {
                await expect(
                    canvasOf(canvasElement).getByRole('group', { name: COUNSELLING_LABEL })
                ).toBeInTheDocument();
            });
        }

        await pickBooleanOption(adapter, canvasElement, SMOKING_LABEL, 'No');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                if (adapter === 'dhis2-ui') {
                    await expect(canvas.queryByText(COUNSELLING_LABEL)).not.toBeInTheDocument();
                    return;
                }
                if (adapter === 'mantine') {
                    await expect(
                        canvas.queryByRole('radiogroup', { name: COUNSELLING_LABEL })
                    ).not.toBeInTheDocument();
                    return;
                }
                await expect(
                    canvas.queryByRole('group', { name: COUNSELLING_LABEL })
                ).not.toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
        );
    };

    const nonSmokerHidesCounsellingFromSmoker: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);

        if (adapter === 'mantine') {
            await expect(
                canvas.getByRole('radiogroup', { name: COUNSELLING_LABEL })
            ).toBeInTheDocument();
        } else if (adapter === 'dhis2-ui') {
            await expect(canvas.getByText(COUNSELLING_LABEL)).toBeInTheDocument();
        } else {
            await expect(
                canvas.getByRole('group', { name: COUNSELLING_LABEL })
            ).toBeInTheDocument();
        }

        await pickBooleanOption(adapter, canvasElement, SMOKING_LABEL, 'No');

        await waitFor(
            async () => {
                if (adapter === 'dhis2-ui') {
                    await expect(canvas.queryByText(COUNSELLING_LABEL)).not.toBeInTheDocument();
                    return;
                }
                if (adapter === 'mantine') {
                    await expect(
                        canvas.queryByRole('radiogroup', { name: COUNSELLING_LABEL })
                    ).not.toBeInTheDocument();
                    return;
                }
                await expect(
                    canvas.queryByRole('group', { name: COUNSELLING_LABEL })
                ).not.toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
        );
    };

    const submitForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await pickBooleanOption(adapter, canvasElement, SMOKING_LABEL, 'Yes');
        await typeHemoglobin(canvasElement, '12');
        await userEvent.click(canvas.getByRole('button', { name: /save/i }));
    };

    return {
        rendersForm,
        fillsHemoglobin,
        lowHemoglobinWarning,
        highHemoglobinError,
        nonSmokerHidesCounselling,
        nonSmokerHidesCounsellingFromSmoker,
        submitForm,
    };
}
