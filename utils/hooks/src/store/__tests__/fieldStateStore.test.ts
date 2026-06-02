import { describe, expect, it, vi } from 'vitest';
import { createEmptyFieldState, type FieldStateMap } from '@dhis2-form-utils/rules';
import { createFieldStateStore } from '../fieldStateStore';

describe('createFieldStateStore', () => {
    it('preserves reference identity for unchanged fields', () => {
        const store = createFieldStateStore();

        const a1 = { ...createEmptyFieldState(), warning: 'x' };
        store.setState({ a: a1 });
        const first = store.getFieldState('a');

        const a2 = { ...createEmptyFieldState(), warning: 'x' };
        store.setState({ a: a2 });
        const second = store.getFieldState('a');

        expect(second).toBe(first);
    });

    it('notifies only changed field listeners', () => {
        const store = createFieldStateStore();
        store.setState({
            a: { ...createEmptyFieldState(), warning: null },
            b: { ...createEmptyFieldState(), warning: null },
        });

        const onA = vi.fn();
        const onB = vi.fn();
        store.subscribeField('a', onA);
        store.subscribeField('b', onB);

        store.setState({
            a: { ...createEmptyFieldState(), warning: 'changed' },
            b: { ...createEmptyFieldState(), warning: null },
        });

        expect(onA).toHaveBeenCalledTimes(1);
        expect(onB).toHaveBeenCalledTimes(0);
    });

    it('fires global listener when any field changes', () => {
        const store = createFieldStateStore();

        const onAll = vi.fn();
        store.subscribeAll(onAll);

        store.setState({ a: { ...createEmptyFieldState(), warning: 'x' } });
        expect(onAll).toHaveBeenCalledTimes(1);
    });

    it('does not fire global listener when nothing changed', () => {
        const store = createFieldStateStore();

        const onAll = vi.fn();
        store.subscribeAll(onAll);

        const next: FieldStateMap = { a: { ...createEmptyFieldState(), warning: 'x' } };
        store.setState(next);
        store.setState({ a: { ...createEmptyFieldState(), warning: 'x' } });

        expect(onAll).toHaveBeenCalledTimes(1);
    });

    it('treats removed fields as changed', () => {
        const store = createFieldStateStore({
            a: { ...createEmptyFieldState(), warning: null },
            b: { ...createEmptyFieldState(), warning: null },
        });

        const onB = vi.fn();
        store.subscribeField('b', onB);

        store.setState({ a: { ...createEmptyFieldState(), warning: null } });

        expect(onB).toHaveBeenCalledTimes(1);
    });
});
