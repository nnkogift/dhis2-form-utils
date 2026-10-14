import type { NotificationTemplate } from '../api/serverRuleActionsQuery';

/** "TYPE · target name" for the template's recipient, or null when it names neither. */
export function resolveNotificationRecipient(template: NotificationTemplate): string | null {
    const target =
        template.recipientUserGroup ??
        template.recipientProgramAttribute ??
        template.recipientDataElement;
    const parts = [template.notificationRecipient, target?.displayName ?? target?.id];
    return parts.filter(Boolean).join(' · ') || null;
}
