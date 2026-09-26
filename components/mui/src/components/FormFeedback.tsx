// fallow-ignore-file code-duplication
import { Box } from '@mui/material';
import { useFormFeedback } from '@nnkogift/dhis2-form-utils-hooks';

import { FeedbackPanel } from './FeedbackPanel';

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
