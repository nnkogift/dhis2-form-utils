import { NoticeBox } from '@dhis2/ui';
import { useFormFeedback } from '@dhis2-form-utils/hooks';

type FeedbackItem = ReturnType<typeof useFormFeedback>[string];

function FeedbackPanel({ title, items }: { title: string; items: FeedbackItem[] }) {
    if (!items.length) {
        return null;
    }

    return (
        <div style={{ marginBottom: 'var(--spacers-dp16)' }}>
            <h3 style={{ margin: '0 0 var(--spacers-dp8)' }}>{title}</h3>
            {items.map((item) => (
                <NoticeBox key={`${item.location}:${item.content}`} title={item.content}>
                    {item.type === 'keyValuePair' ? (
                        <>
                            <strong>{item.content}</strong>: {item.value}
                        </>
                    ) : (
                        item.value
                    )}
                </NoticeBox>
            ))}
        </div>
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
        <div>
            <FeedbackPanel title="Feedback" items={feedbackItems} />
            <FeedbackPanel title="Program indicators" items={indicatorItems} />
        </div>
    );
}
