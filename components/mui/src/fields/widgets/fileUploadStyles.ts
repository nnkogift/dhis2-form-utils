import type { CSSProperties } from 'react';

/**
 * Visually hides the native file input without `display: none` — the
 * `hidden` attribute makes the element untestable via real-browser
 * `userEvent.upload()` (Playwright honors visibility), so this uses the same
 * clip-based technique as MUI's own file-upload-button docs example.
 */
export const visuallyHiddenInput: CSSProperties = {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
};
