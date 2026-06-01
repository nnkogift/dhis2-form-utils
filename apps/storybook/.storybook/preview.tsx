import '@mantine/core/styles.css';
import type { Preview } from '@storybook/react-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { withFormDecorators } from '../decorators/withFormDecorators';
import { mswHandlers } from './msw-handlers';

initialize({ onUnhandledRequest: 'bypass' });

const preview: Preview = {
    decorators: [withFormDecorators()],
    loaders: [mswLoader],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        msw: { handlers: mswHandlers },
    },
};

export default preview;
