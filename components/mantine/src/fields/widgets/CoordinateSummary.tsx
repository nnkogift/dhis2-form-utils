import { Group, Text } from '@mantine/core';
import { parseCoordinateValue } from '@nnkogift/dhis2-form-utils-map';

// A definition list pairs each axis label with its value for assistive tech, and tabular figures
// keep the digits from jittering in width as the user edits the pair.
export function CoordinateSummary({ value }: { value: string }) {
    const parsed = parseCoordinateValue(value);
    if (!parsed) {
        return (
            <Text c="dimmed" size="sm">
                No location set
            </Text>
        );
    }

    return (
        <Group component="dl" gap="md" m={0}>
            <Group gap={4} align="baseline">
                <Text component="dt" size="xs" fw={600} tt="uppercase" c="dimmed" m={0}>
                    Lat
                </Text>
                <Text
                    component="dd"
                    size="sm"
                    fw={500}
                    m={0}
                    styles={{ root: { fontVariantNumeric: 'tabular-nums' } }}
                >
                    {parsed.lat.toFixed(5)}
                </Text>
            </Group>
            <Group gap={4} align="baseline">
                <Text component="dt" size="xs" fw={600} tt="uppercase" c="dimmed" m={0}>
                    Lng
                </Text>
                <Text
                    component="dd"
                    size="sm"
                    fw={500}
                    m={0}
                    styles={{ root: { fontVariantNumeric: 'tabular-nums' } }}
                >
                    {parsed.lng.toFixed(5)}
                </Text>
            </Group>
        </Group>
    );
}
