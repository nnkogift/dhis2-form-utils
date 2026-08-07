import { D2Field } from '@nnkogift/dhis2-form-utils-mantine';
import type { WidgetKind } from '@nnkogift/dhis2-form-utils-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MantineProvider } from '@mantine/core';
import { makeFieldPsde } from '../../fixtures/fieldMetadata';
import {
    fieldStoryArgTypes,
    fieldStoryDefaultArgs,
    withFieldStoryForm,
} from '../../decorators/fieldStory';
import { fieldStoryPlays } from '../../interactions/fieldStoryInteractions';

const plays = fieldStoryPlays('mantine');

function FieldStory({ widgetKind }: { widgetKind: WidgetKind }) {
    return <D2Field field={{ kind: 'dataElement', config: makeFieldPsde(widgetKind) }} />;
}

const meta: Meta<typeof FieldStory> = {
    title: 'mantine/D2Field',
    component: FieldStory,
    tags: ['autodocs'],
    args: fieldStoryDefaultArgs,
    argTypes: fieldStoryArgTypes,
    decorators: [
        (Story) => (
            <MantineProvider>
                <Story />
            </MantineProvider>
        ),
        withFieldStoryForm,
    ],
};

export default meta;
type Story = StoryObj<typeof FieldStory>;

export const Playground: Story = {
    play: plays.textInput('text', 'Hello Mantine'),
};

export const Mandatory: Story = {
    args: { mandatory: true },
    play: plays.showsRequired,
};

export const WithWarning: Story = {
    args: { warning: 'Please verify this value' },
    play: plays.showsWarning(),
};

export const WithError: Story = {
    args: { error: 'Invalid value' },
    play: plays.showsError(),
};

export const Hidden: Story = {
    args: { hidden: true },
    play: plays.fieldHidden,
};

export const Integer: Story = {
    args: { widgetKind: 'integer' },
    play: plays.integerInput,
};

export const Select: Story = {
    args: { widgetKind: 'select' },
    play: plays.selectOption,
};

export const MultiSelect: Story = {
    args: { widgetKind: 'multiSelect' },
    play: plays.multiSelectOption,
};

export const Boolean: Story = {
    args: { widgetKind: 'boolean' },
    play: plays.booleanYes,
};

export const Date: Story = {
    args: { widgetKind: 'date' },
    play: plays.dateInput,
};

export const Time: Story = {
    args: { widgetKind: 'time' },
    play: plays.timeInput,
};

export const DateTime: Story = {
    args: { widgetKind: 'datetime' },
    play: plays.datetimeInput,
};

export const Age: Story = {
    args: { widgetKind: 'age', defaultValue: '2000-01-01' },
    play: plays.ageShowsComputedAge,
};

export const Coordinate: Story = {
    args: { widgetKind: 'coordinate' },
    play: plays.coordinateInput,
};

export const GeoJson: Story = {
    args: { widgetKind: 'geojson' },
    play: plays.geojsonDraw,
};

export const OrgUnit: Story = {
    args: { widgetKind: 'orgUnit' },
    play: plays.orgUnitSelect,
};

export const FileUpload: Story = {
    args: { widgetKind: 'file' },
    play: plays.fileUpload('file'),
};

export const ImageUpload: Story = {
    args: { widgetKind: 'image' },
    play: plays.fileUpload('image'),
};
