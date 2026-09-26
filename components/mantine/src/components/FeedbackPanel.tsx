import { Alert, Stack, Text, Title } from '@mantine/core';
import { useFormFeedback } from '@nnkogift/dhis2-form-utils-hooks';

type FeedbackItem = ReturnType<typeof useFormFeedback>[string];

export function FeedbackPanel({ title, items }: { title: string; items: FeedbackItem[] }) {
    if (!items.length) {
        return null;
    }

    return (
        <Stack gap="sm" mb="md">
            <Title order={5}>{title}</Title>
            {items.map((item) => (
                <Alert key={`${item.location}:${item.content}`} title={item.content} color="blue">
                    <Text>
                        {item.value ? (
                            <>
                                <Text span fw={600}>
                                    {item.content}
                                </Text>
                                : {item.value}
                            </>
                        ) : (
                            item.content
                        )}
                    </Text>
                </Alert>
            ))}
        </Stack>
    );
}
