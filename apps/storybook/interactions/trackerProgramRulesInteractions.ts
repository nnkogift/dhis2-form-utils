import { expect, userEvent, waitFor, within } from 'storybook/test';
import { RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS, RULE_EFFECT_WAIT_TIMEOUT_MS } from './waitTimeouts';

export type TrackerProgramRulesAdapter = 'dhis2-ui' | 'mantine' | 'mui';

export type StoryPlayContext = {
    canvasElement: HTMLElement;
};

type StoryPlay = (context: StoryPlayContext) => Promise<void>;

// No trailing `$` anchor: "First name" is mandatory in the fixture, so dhis2-ui always renders
// its label with a trailing "*" (e.g. "First name *").
const FIRST_NAME_LABEL = /^First name/i;
const AGE_LABEL = /^Age \(years\)$/i;
// No trailing `$` anchor: the dhis2-ui single-select field's matched element includes both the
// label and the currently selected value text (e.g. "Consent givenYes") once a value is picked.
const CONSENT_LABEL = /^Consent given/i;
const NOTES_LABEL = /^Notes \(hide target\)$/i;
const RISK_SCORE_LABEL = /Risk score/i;
// No trailing `$` anchor: dhis2-ui appends an unspaced "*" to the label text once
// SETMANDATORYFIELD makes the field required (e.g. "Occupation (mandatory target)*").
const OCCUPATION_LABEL = /^Occupation \(mandatory target\)/i;

const AGE_IMPLAUSIBLE_WARNING = /Age looks implausible/i;
const FIRST_NAME_TOO_SHORT_ERROR = /First name must be at least 2 characters/i;

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

function queryAgeInput(canvas: Canvas) {
    try {
        return canvas.getByRole('spinbutton', { name: AGE_LABEL });
    } catch {
        return canvas.getByRole('textbox', { name: AGE_LABEL });
    }
}

async function typeFirstName(canvasElement: HTMLElement, value: string) {
    const canvas = canvasOf(canvasElement);
    const input = canvas.getByLabelText(FIRST_NAME_LABEL);
    await userEvent.clear(input);
    await userEvent.type(input, value);
}

async function typeAge(canvasElement: HTMLElement, value: string) {
    const canvas = canvasOf(canvasElement);
    const input = queryAgeInput(canvas);
    await userEvent.clear(input);
    await userEvent.type(input, value);
}

async function pickBooleanOption(
    adapter: TrackerProgramRulesAdapter,
    canvasElement: HTMLElement,
    fieldLabel: RegExp,
    optionLabel: 'Yes' | 'No'
) {
    const canvas = canvasOf(canvasElement);

    if (adapter === 'dhis2-ui') {
        const field = Array.from(canvasElement.querySelectorAll('fieldset')).find((element) =>
            fieldLabel.test(element.textContent ?? '')
        );
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

export function trackerProgramRulesPlays(adapter: TrackerProgramRulesAdapter) {
    const rendersForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByRole('button', { name: /register/i })).toBeInTheDocument();
        await expect(canvas.getByLabelText(FIRST_NAME_LABEL)).toBeInTheDocument();
        await expect(queryAgeInput(canvas)).toBeInTheDocument();
    };

    const fillsFirstName: StoryPlay = async ({ canvasElement }) => {
        await typeFirstName(canvasElement, 'Amina');
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByLabelText(FIRST_NAME_LABEL)).toHaveValue('Amina');
    };

    const hideFieldWhenConsentFalse: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        // Consent starts unset, which the rule engine treats as falsy — PRT-T01 already fires
        // before any interaction, so "Notes (hide target)" is hidden from the very first render.
        await expect(canvas.queryByLabelText(NOTES_LABEL)).not.toBeInTheDocument();

        await pickBooleanOption(adapter, canvasElement, CONSENT_LABEL, 'Yes');

        await waitFor(
            async () => {
                await expect(canvas.getByLabelText(NOTES_LABEL)).toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
        );

        await pickBooleanOption(adapter, canvasElement, CONSENT_LABEL, 'No');

        await waitFor(
            async () => {
                await expect(canvas.queryByLabelText(NOTES_LABEL)).not.toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
        );
    };

    const showWarningWhenAgeAboveLimit: StoryPlay = async ({ canvasElement }) => {
        await typeAge(canvasElement, '150');
        const canvas = canvasOf(canvasElement);

        if (adapter === 'dhis2-ui') {
            await waitFor(
                async () => {
                    await expect(canvas.getByText(AGE_IMPLAUSIBLE_WARNING)).toBeInTheDocument();
                },
                { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
            );
            return;
        }

        await waitFor(
            async () => {
                const input = queryAgeInput(canvas);
                if (input instanceof HTMLInputElement && input.type === 'number') {
                    await expect(input).toHaveValue(150);
                } else {
                    await expect(input).toHaveValue('150');
                }
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const showErrorWhenFirstNameTooShort: StoryPlay = async ({ canvasElement }) => {
        await typeFirstName(canvasElement, 'A');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                await expect(canvas.getByText(FIRST_NAME_TOO_SHORT_ERROR)).toBeInTheDocument();
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const assignRiskScoreFromAge: StoryPlay = async ({ canvasElement }) => {
        await typeAge(canvasElement, '40');
        const canvas = canvasOf(canvasElement);

        await waitFor(
            async () => {
                const riskScore = (() => {
                    try {
                        return canvas.getByRole('spinbutton', { name: RISK_SCORE_LABEL });
                    } catch {
                        return canvas.getByRole('textbox', { name: RISK_SCORE_LABEL });
                    }
                })();
                if (riskScore instanceof HTMLInputElement && riskScore.type === 'number') {
                    await expect(riskScore).toHaveValue(4);
                } else {
                    await expect(riskScore).toHaveValue('4');
                }
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const mandatoryOccupationWhenAdult: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByLabelText(OCCUPATION_LABEL)).not.toBeRequired();

        await typeAge(canvasElement, '25');

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
                await expect(canvas.getByLabelText(OCCUPATION_LABEL)).toBeRequired();
            },
            { timeout: RULE_EFFECT_EXTENDED_WAIT_TIMEOUT_MS }
        );
    };

    const displaysRegistrationFeedback: StoryPlay = async ({ canvasElement }) => {
        await typeFirstName(canvasElement, 'Amina');

        await waitFor(
            async () => {
                await expect(findFeedbackText(canvasElement, [/Registering:/i, /Amina/i])).toBe(
                    true
                );
            },
            { timeout: RULE_EFFECT_WAIT_TIMEOUT_MS }
        );
    };

    const submitForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await typeFirstName(canvasElement, 'Amina');
        await userEvent.click(canvas.getByRole('button', { name: /register/i }));
    };

    return {
        rendersForm,
        fillsFirstName,
        hideFieldWhenConsentFalse,
        showWarningWhenAgeAboveLimit,
        showErrorWhenFirstNameTooShort,
        assignRiskScoreFromAge,
        mandatoryOccupationWhenAdult,
        displaysRegistrationFeedback,
        submitForm,
    };
}
