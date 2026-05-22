import '@mantine/core/styles.css';
import type { Preview } from '@storybook/react';
import { withFormDecorators } from '../decorators/withFormDecorators';

const preview: Preview = {
    decorators: [withFormDecorators()],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
