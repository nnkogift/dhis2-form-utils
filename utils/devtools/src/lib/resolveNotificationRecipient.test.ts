import { describe, expect, it } from 'vitest';
import { resolveNotificationRecipient } from './resolveNotificationRecipient';

describe('resolveNotificationRecipient', () => {
    it('returns null when the template names no recipient', () => {
        expect(resolveNotificationRecipient({ id: 't' })).toBeNull();
    });

    it('returns just the recipient type without a target', () => {
        expect(
            resolveNotificationRecipient({
                id: 't',
                notificationRecipient: 'TRACKED_ENTITY_INSTANCE',
            })
        ).toBe('TRACKED_ENTITY_INSTANCE');
    });

    it.each([
        ['recipientUserGroup', 'Clinicians'],
        ['recipientProgramAttribute', 'Phone'],
        ['recipientDataElement', 'Contact'],
    ] as const)('appends the %s display name', (field, name) => {
        expect(
            resolveNotificationRecipient({
                id: 't',
                notificationRecipient: 'X',
                [field]: { id: 'u1', displayName: name },
            })
        ).toBe(`X · ${name}`);
    });

    it('falls back to the target id when it has no display name', () => {
        expect(
            resolveNotificationRecipient({
                id: 't',
                notificationRecipient: 'USER_GROUP',
                recipientUserGroup: { id: 'ug1' },
            })
        ).toBe('USER_GROUP · ug1');
    });
});
