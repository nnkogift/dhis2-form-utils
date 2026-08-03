import { translate } from './i18n';

export function formatAgo(timestamp: number, now = Date.now()): string {
    const diffMs = Math.max(0, now - timestamp);

    if (diffMs < 5_000) {
        return translate('just now');
    }

    const seconds = Math.floor(diffMs / 1_000);
    if (seconds < 60) {
        return translate('{{seconds}}s ago', { seconds });
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return translate('{{minutes}}m ago', { minutes });
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return translate('{{hours}}h ago', { hours });
    }

    return new Date(timestamp).toLocaleString();
}
