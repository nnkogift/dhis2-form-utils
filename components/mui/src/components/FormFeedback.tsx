import { Alert, Box, Stack, Typography } from '@mui/material';
import { useFormFeedback } from '@dhis2-form-utils/hooks';

type FeedbackItem = ReturnType<typeof useFormFeedback>[string];

function FeedbackPanel({ title, items }: { title: string; items: FeedbackItem[] }) {
    if (!items.length) {
        return null;
    }

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {title}
            </Typography>
            <Stack spacing={1}>
                {items.map((item) => (
                    <Alert key={`${item.location}:${item.content}`} severity="info">
                        {item.type === 'keyValuePair' ? (
                            <>
                                <strong>{item.content}</strong>: {item.value}
                            </>
                        ) : (
                            item.value
                        )}
                    </Alert>
                ))}
            </Stack>
        </Box>
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
        <Box>
            <FeedbackPanel title="Feedback" items={feedbackItems} />
            <FeedbackPanel title="Program indicators" items={indicatorItems} />
        </Box>
    );
}
