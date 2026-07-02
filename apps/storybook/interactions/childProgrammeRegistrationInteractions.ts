import { expect, screen, userEvent, within } from 'storybook/test';

export type ChildProgrammeRegistrationAdapter = 'dhis2-ui' | 'mantine' | 'mui';

export type StoryPlayContext = {
    canvasElement: HTMLElement;
};

export type StoryPlay = (context: StoryPlayContext) => Promise<void>;

const FIRST_NAME_LABEL = /^First name$/i;
const LAST_NAME_LABEL = /^Last name$/i;
const GENDER_LABEL = /Gender/i;
const ENROLLMENT_DATE_LABEL = /Date of enrollment/i;
const BIRTH_DATE_LABEL = /Date of birth/i;

type Canvas = ReturnType<typeof within>;

function canvasOf(canvasElement: HTMLElement): Canvas {
    return within(canvasElement);
}

async function pickSelectOption(
    adapter: ChildProgrammeRegistrationAdapter,
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

async function assertSelectFieldVisible(
    adapter: ChildProgrammeRegistrationAdapter,
    canvasElement: HTMLElement,
    canvas: Canvas,
    fieldLabel: RegExp
) {
    if (adapter === 'dhis2-ui') {
        const field = Array.from(
            canvasElement.querySelectorAll('[data-test="dhis2-uiwidgets-singleselectfield"]')
        ).find((element) => fieldLabel.test(element.textContent ?? ''));
        await expect(field).toBeTruthy();
        return;
    }

    await expect(canvas.getByLabelText(fieldLabel)).toBeInTheDocument();
}

export function childProgrammeRegistrationPlays(adapter: ChildProgrammeRegistrationAdapter) {
    const rendersForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await expect(canvas.getByRole('button', { name: /register/i })).toBeInTheDocument();
        await expect(canvas.getByLabelText(FIRST_NAME_LABEL)).toBeInTheDocument();
        await expect(canvas.getByLabelText(LAST_NAME_LABEL)).toBeInTheDocument();
        await assertSelectFieldVisible(adapter, canvasElement, canvas, GENDER_LABEL);
        await expect(canvas.getByLabelText(ENROLLMENT_DATE_LABEL)).toBeInTheDocument();
        await expect(canvas.getByLabelText(BIRTH_DATE_LABEL)).toBeInTheDocument();
    };

    const fillsNameFields: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        const firstName = canvas.getByLabelText(FIRST_NAME_LABEL);
        const lastName = canvas.getByLabelText(LAST_NAME_LABEL);

        await userEvent.clear(firstName);
        await userEvent.type(firstName, 'Amina');
        await userEvent.clear(lastName);
        await userEvent.type(lastName, 'Traore');

        await expect(firstName).toHaveValue('Amina');
        await expect(lastName).toHaveValue('Traore');
    };

    const selectsGender: StoryPlay = async ({ canvasElement }) => {
        await pickSelectOption(adapter, canvasElement, GENDER_LABEL, 'Female');
    };

    const submitForm: StoryPlay = async ({ canvasElement }) => {
        const canvas = canvasOf(canvasElement);
        await userEvent.clear(canvas.getByLabelText(FIRST_NAME_LABEL));
        await userEvent.type(canvas.getByLabelText(FIRST_NAME_LABEL), 'Amina');
        await userEvent.clear(canvas.getByLabelText(LAST_NAME_LABEL));
        await userEvent.type(canvas.getByLabelText(LAST_NAME_LABEL), 'Traore');
        await userEvent.click(canvas.getByRole('button', { name: /register/i }));
    };

    return {
        rendersForm,
        fillsNameFields,
        selectsGender,
        submitForm,
    };
}
