import { D2Field, FormFeedback } from '@dhis2-form-utils/dhis2-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgrammeEventForm } from '../../components/ProgrammeEventForm';
import { withEventForm } from '../../decorators/withEventForm';
import {
    EVENT_RULES_STAGE_ID,
    eventProgramRulesMetadata,
    eventProgramRulesOptionGroups,
} from '../../fixtures/eventProgramRules';
import { eventProgramRulesPlays } from '../../interactions/eventProgramRulesInteractions';
import type { StoryPlayContext } from '../../interactions/eventProgramRulesInteractions';

const plays = eventProgramRulesPlays('dhis2-ui');

function Dhis2EventProgramRulesForm() {
    return <ProgrammeEventForm Field={D2Field} Feedback={FormFeedback} />;
}

const meta = {
    title: 'dhis2-ui/Event Program Rules Example',
    component: Dhis2EventProgramRulesForm,
    tags: ['autodocs'],
    decorators: [
        withEventForm({
            programStageId: EVENT_RULES_STAGE_ID,
            metadata: eventProgramRulesMetadata,
            optionGroups: eventProgramRulesOptionGroups,
        }),
    ],
} satisfies Meta<typeof Dhis2EventProgramRulesForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async (context: StoryPlayContext) => {
        await plays.rendersForm(context);
        await plays.fillsNumber(context);
    },
};

export const HideFieldWhenToggleOn: Story = {
    parameters: {
        docs: {
            description: {
                story: 'HIDEFIELD: toggling "Toggle hide field" on hides the "Hide target field" field.',
            },
        },
    },
    play: plays.hideFieldWhenToggleOn,
};

export const HideSectionWhenToggleOn: Story = {
    parameters: {
        docs: {
            description: {
                story: 'HIDESECTION: toggling "Toggle hide section" on hides the entire "Section to Hide" section.',
            },
        },
    },
    play: plays.hideSectionWhenToggleOn,
};

export const ShowWarningAboveHundred: Story = {
    parameters: {
        docs: {
            description: {
                story: 'SHOWWARNING: a number above 100 shows a warning on the number field.',
            },
        },
    },
    play: plays.showWarningAboveHundred,
};

export const ShowErrorBelowZero: Story = {
    parameters: {
        docs: {
            description: {
                story: 'SHOWERROR: a negative number shows an error on the number field.',
            },
        },
    },
    play: plays.showErrorBelowZero,
};

export const AssignDoublesNumber: Story = {
    parameters: {
        docs: {
            description: {
                story: 'ASSIGN: the "Assigned value" field is kept in sync with number input x 2.',
            },
        },
    },
    play: plays.assignDoublesNumber,
};

export const MandatoryTargetViaTriggerText: Story = {
    parameters: {
        docs: {
            description: {
                story: 'SETMANDATORYFIELD: typing "mandatory" into the trigger text field makes the "Mandatory target" field required.',
            },
        },
    },
    play: plays.mandatoryTargetViaTriggerText,
};

export const HideOptionRedViaTriggerText: Story = {
    parameters: {
        docs: {
            description: {
                story: 'HIDEOPTION: typing "hidered" into the trigger text field removes "Red" from the Colour options.',
            },
        },
    },
    play: plays.hideOptionRedViaTriggerText,
};

export const OptionGroupVisibility: Story = {
    parameters: {
        docs: {
            description: {
                story: 'HIDEOPTIONGROUP/SHOWOPTIONGROUP: "hidewarm" removes Yellow and Red (the "Warm colours" option group) from Colour, "showwarm" restores them.',
            },
        },
    },
    play: plays.optionGroupVisibilityViaTriggerText,
};

export const FeedbackAndIndicators: Story = {
    parameters: {
        docs: {
            description: {
                story: 'DISPLAYTEXT/DISPLAYKEYVALUEPAIR: the trigger text is echoed in the feedback panel, and the number x 2 calculated value is shown as a program indicator.',
            },
        },
    },
    play: plays.feedbackAndIndicators,
};

export const Submit: Story = {
    play: plays.submitForm,
};
