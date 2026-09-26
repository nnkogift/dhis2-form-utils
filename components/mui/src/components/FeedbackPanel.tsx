import { Alert, Box, Stack, Typography } from '@mui/material';
import { useFormFeedback } from '@nnkogift/dhis2-form-utils-hooks';

type FeedbackItem = ReturnType<typeof useFormFeedback>[string];

export function FeedbackPanel({ title, items }: { title: string; items: FeedbackItem[] }) {
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
                        {item.value ? (
                            <>
                                <strong>{item.content}</strong>: {item.value}
                            </>
                        ) : (
                            item.content
                        )}
                    </Alert>
                ))}
            </Stack>
        </Box>
    );
}
