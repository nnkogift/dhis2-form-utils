import { Box, Typography } from '@mui/material';
import { parseCoordinateValue } from '@nnkogift/dhis2-form-utils-map';

// A definition list pairs each axis label with its value for assistive tech, and tabular figures
// keep the digits from jittering in width as the user edits the pair.
export function CoordinateSummary({ value }: { value: string }) {
    const parsed = parseCoordinateValue(value);
    if (!parsed) {
        return (
            <Typography variant="body2" color="text.secondary">
                No location set
            </Typography>
        );
    }

    return (
        <Box component="dl" sx={{ display: 'flex', gap: 2, m: 0 }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
                <Typography
                    component="dt"
                    variant="caption"
                    color="text.secondary"
                    sx={{ m: 0, textTransform: 'uppercase', fontWeight: 600 }}
                >
                    Lat
                </Typography>
                <Typography
                    component="dd"
                    variant="body2"
                    sx={{ m: 0, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
                >
                    {parsed.lat.toFixed(5)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
                <Typography
                    component="dt"
                    variant="caption"
                    color="text.secondary"
                    sx={{ m: 0, textTransform: 'uppercase', fontWeight: 600 }}
                >
                    Lng
                </Typography>
                <Typography
                    component="dd"
                    variant="body2"
                    sx={{ m: 0, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
                >
                    {parsed.lng.toFixed(5)}
                </Typography>
            </Box>
        </Box>
    );
}
