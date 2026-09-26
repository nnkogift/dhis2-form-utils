import dayjs from 'dayjs';

/** Shared by D2DateField / D2DateTimeField. */
export const today = () => dayjs().endOf('day').toDate();

export const parseDate = (value: string): Date | null => {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : null;
};
