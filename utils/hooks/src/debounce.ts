export type DebouncedFn<T extends (...args: never[]) => void> = ((
    ...args: Parameters<T>
) => void) & {
    cancel: () => void;
};

/** Lightweight cancelable debounce (replaces lodash-es debounce for one call site). */
export function debounce<T extends (...args: never[]) => void>(
    fn: T,
    waitMs: number
): DebouncedFn<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debounced = ((...args: Parameters<T>) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = null;
            fn(...args);
        }, waitMs);
    }) as DebouncedFn<T>;

    debounced.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced;
}
