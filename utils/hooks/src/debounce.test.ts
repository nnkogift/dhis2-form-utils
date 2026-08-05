import { debounce } from './debounce';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('invokes the function after the wait', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 40);

        debounced();
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(40);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels a pending invocation', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 40);

        debounced();
        debounced.cancel();
        vi.advanceTimersByTime(40);

        expect(fn).not.toHaveBeenCalled();
    });
});
