import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

/** Shared by D2DateField / D2TimeField / D2DateTimeField. */
export const parseDayjs = (value: string): Dayjs | null => {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
};

export function withLocalization(children: ReactNode) {
    return <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>;
}
