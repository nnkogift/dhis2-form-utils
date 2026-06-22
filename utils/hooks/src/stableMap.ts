export function stableMap<T extends Record<string, object>>(prev: T, next: T): T {
    const result = {} as T;
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);

    for (const key of keys) {
        if (key in prev && key in next && prev[key as keyof T] === next[key as keyof T]) {
            result[key as keyof T] = prev[key as keyof T];
            continue;
        }

        if (key in next) {
            result[key as keyof T] = next[key as keyof T];
        }
    }

    return result;
}
