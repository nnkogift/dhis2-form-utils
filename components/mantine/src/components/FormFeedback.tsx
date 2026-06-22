import { Alert, Stack, Text, Title } from '@mantine/core';
import { useFormFeedback } from '@dhis2-form-utils/hooks';

type FeedbackItem = ReturnType<typeof useFormFeedback>[string];

function FeedbackPanel({ title, items }: { title: string; items: FeedbackItem[] }) {
    if (!items.length) {
        return null;
    }

    return (
        <Stack gap="sm" mb="md">
            <Title order={5}>{title}</Title>
            {items.map((item) => (
                <Alert key={`${item.location}:${item.content}`} title={item.content} color="blue">
                    {item.type === 'keyValuePair' ? (
                        <Text>
                            <Text span fw={600}>
                                {item.content}
                            </Text>
                            : {item.value}
                        </Text>
                    ) : (
                        <Text>{item.value}</Text>
                    )}
                </Alert>
            ))}
        </Stack>
    );
}

export function FormFeedback() {
    const feedback = useFormFeedback();
    const items = Object.values(feedback);
    const feedbackItems = items.filter((item) => item.location === 'feedback');
    const indicatorItems = items.filter((item) => item.location === 'indicators');

    if (!feedbackItems.length && !indicatorItems.length) {
        return null;
    }

    return (
        <Stack gap="md">
            <FeedbackPanel title="Feedback" items={feedbackItems} />
            <FeedbackPanel title="Program indicators" items={indicatorItems} />
        </Stack>
    );
}
