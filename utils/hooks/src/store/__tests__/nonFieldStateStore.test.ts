import { describe, expect, it, vi } from 'vitest';
import { createNonFieldStateStore } from '../nonFieldStateStore';

describe('createNonFieldStateStore', () => {
    it('preserves reference identity for unchanged sections', () => {
        const store = createNonFieldStateStore();

        store.setState({ 'section-a': { hidden: true } }, {});
        const first = store.getSectionSnapshot('section-a');

        store.setState({ 'section-a': { hidden: true } }, {});
        const second = store.getSectionSnapshot('section-a');

        expect(second).toBe(first);
    });

    it('notifies only changed section listeners', () => {
        const store = createNonFieldStateStore();
        store.setState(
            {
                a: { hidden: false },
                b: { hidden: false },
            },
            {}
        );

        const onA = vi.fn();
        const onB = vi.fn();
        store.subscribeSection('a', onA);
        store.subscribeSection('b', onB);

        store.setState({ a: { hidden: true }, b: { hidden: false } }, {});

        expect(onA).toHaveBeenCalledTimes(1);
        expect(onB).toHaveBeenCalledTimes(0);
    });

    it('fires feedback listeners only when feedback map changes', () => {
        const store = createNonFieldStateStore();

        const onFeedback = vi.fn();
        store.subscribeFeedback(onFeedback);

        store.setState({}, {});
        expect(onFeedback).toHaveBeenCalledTimes(0);

        store.setState(
            {},
            {
                'feedback:Label': {
                    type: 'text',
                    content: 'Label',
                    value: 'Value',
                    location: 'feedback',
                },
            }
        );
        expect(onFeedback).toHaveBeenCalledTimes(1);

        store.setState(
            {},
            {
                'feedback:Label': {
                    type: 'text',
                    content: 'Label',
                    value: 'Value',
                    location: 'feedback',
                },
            }
        );
        expect(onFeedback).toHaveBeenCalledTimes(1);
    });
});
