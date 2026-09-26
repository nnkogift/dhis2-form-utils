import { NoticeBox } from '@dhis2/ui';
import { useFormFeedback } from '@nnkogift/dhis2-form-utils-hooks';

import './formFeedbackLayout.css';

type FeedbackItem = ReturnType<typeof useFormFeedback>[string];

export function FeedbackPanel({ title, items }: { title: string; items: FeedbackItem[] }) {
    if (!items.length) {
        return null;
    }

    return (
        <div className="d2-feedback-panel">
            <h3 className="d2-feedback-panel-title">{title}</h3>
            {items.map((item) => (
                <NoticeBox key={`${item.location}:${item.content}`} title={item.content}>
                    {item.value ? (
                        <>
                            <strong>{item.content}</strong>: {item.value}
                        </>
                    ) : (
                        item.content
                    )}
                </NoticeBox>
            ))}
        </div>
    );
}
