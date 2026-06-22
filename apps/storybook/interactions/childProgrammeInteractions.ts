import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

export type ChildProgrammeAdapter = 'dhis2-ui' | 'mantine' | 'mui';

export type StoryPlayContext = {
    canvasElement: HTMLElement;
};

export type StoryPlay = (context: StoryPlayContext) => Promise<void>;

const APGAR_SCORE_LABEL = /Apgar Score/i;
const APGAR_COMMENT_LABEL = /Apgar comment/i;
const ARV_AT_BIRTH_LABEL = /ARV at birth/i;
const WEIGHT_LABEL = /Weight \(g\)/i;

const LOW_APGAR_WARNING =
    /It is suggested that an explanation is provided when the Apgar score is below 4/i;
const NEGATIVE_APGAR_ERROR = /If the apgar score is below zero, an explanation must be provided/i;
const UNSUPPORTED_FILE_WIDGET = /Widget not yet implemented: file/i;

type Canvas = ReturnType<typeof within>;

function canvasOf(canvasElement: HTMLElement): Canvas {
    return within(canvasElement);
}

function queryApgarScoreInput(canvas: Canvas) {
    try {
        return canvas.getByRole('spinbutton', { name: APGAR_SCORE_LABEL });
    } catch {
        return canvas.getByRole('textbox', { name: APGAR_SCORE_LABEL });
    }
}

async function typeApgarScore(canvasElement: HTMLElement, value: string) {
    const canvas = canvasOf(canvasElement);
    const input = queryApgarScoreInput(canvas);
    await userEvent.clear(input);
    await userEvent.type(input, value);
}

async function pickSelectOption(
    adapter: ChildProgrammeAdapter,
    canvasElement: HTMLElement,
    fieldLabel: RegExp,
    optionLabel: string
) {
    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        const field = Array.from(
            canvasElement.querySelectorAll('[data-test="dhis2-uiwidgets-singleselectfield"]')
        ).find((element) => fieldLabel.test(element.textContent ?? ''));
        if (!field) {
            throw new Error(`DHIS2 select field matching ${fieldLabel} not found`);
        }
        const trigger = field.querySelector('[data-test="dhis2-uicore-select-input"]');
        if (!trigger) throw new Error('DHIS2 single select trigger not found');
        await userEvent.click(trigger);
        await userEvent.click(await screen.findByText(optionLabel));
        return;
    }

    if (adapter === 'mantine') {
        await userEvent.click(canvas.getByRole('textbox', { name: fieldLabel }));
        await userEvent.click(await screen.findByRole('option', { name: optionLabel }));
        return;
    }

    await userEvent.click(canvas.getByRole('combobox', { name: fieldLabel }));
    await userEvent.click(await screen.findByRole('option', { name: optionLabel }));
}

export function childProgrammePlays(adapter: ChildProgrammeAdapter) {
    const rendersForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByRole('button', { name: /save/i })).toBeInTheDocument();
        await expect(canvas.getByText(UNSUPPORTED_FILE_WIDGET)).toBeInTheDocument();
        await expect(queryApgarScoreInput(canvas)).toBeInTheDocument();
        await expect(canvas.getByLabelText(APGAR_COMMENT_LABEL)).toBeInTheDocument();
    };

    const fillsApgarScore: StoryPlay = async ({ canvasElement }) => {
        await typeApgarScore(canvasElement, '3');
        const canvas = canvasOf(canvasElement);
        const input = queryApgarScoreInput(canvas);
        if (input instanceof HTMLInputElement && input.type === 'number') {
            await expect(input).toHaveValue(3);
            return;
        }
        await expect(input).toHaveValue('3');
    };

    const lowApgarWarning: StoryPlay = async ({ canvasElement }) => {
        await typeApgarScore(canvasElement, '2');
        const canvas = canvasOf(canvasElement);

        if (adapter === 'dhis2-ui') {
            await waitFor(
                async () => {
                    await expect(canvas.getByText(LOW_APGAR_WARNING)).toBeInTheDocument();
                },
                { timeout: 1000 }
            );
            return;
        }

        await waitFor(
            async () => {
                const input = queryApgarScoreInput(canvas);
                if (input instanceof HTMLInputElement && input.type === 'number') {
                    await expect(input).toHaveValue(2);
                } else {
                    await expect(input).toHaveValue('2');
                }
                await expect(canvas.getByLabelText(APGAR_COMMENT_LABEL)).toBeInTheDocument();
            },
            { timeout: 1000 }
        );
        await expect(canvas.queryByText(LOW_APGAR_WARNING)).not.toBeInTheDocument();
    };

    const negativeApgarError: StoryPlay = async ({ canvasElement }) => {
        await typeApgarScore(canvasElement, '-1');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                await expect(canvas.getByText(NEGATIVE_APGAR_ERROR)).toBeInTheDocument();
            },
            { timeout: 1000 }
        );
    };

    const highApgarHidesComment: StoryPlay = async ({ canvasElement }) => {
        await typeApgarScore(canvasElement, '8');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                await expect(canvas.queryByLabelText(APGAR_COMMENT_LABEL)).not.toBeInTheDocument();
            },
            { timeout: 1000 }
        );
    };

    const selectArvAtBirth: StoryPlay = async ({ canvasElement }) => {
        await pickSelectOption(adapter, canvasElement, ARV_AT_BIRTH_LABEL, 'NVP only');
    };

    const submitForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await typeApgarScore(canvasElement, '5');

        const weightInput = (() => {
            try {
                return canvas.getByRole('spinbutton', { name: WEIGHT_LABEL });
            } catch {
                return canvas.getByRole('textbox', { name: WEIGHT_LABEL });
            }
        })();
        await userEvent.clear(weightInput);
        await userEvent.type(weightInput, '3200');

        await userEvent.click(canvas.getByRole('button', { name: /save/i }));
    };

    return {
        rendersForm,
        fillsApgarScore,
        lowApgarWarning,
        negativeApgarError,
        highApgarHidesComment,
        selectArvAtBirth,
        submitForm,
    };
}
