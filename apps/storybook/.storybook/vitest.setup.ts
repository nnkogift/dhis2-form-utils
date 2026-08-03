import { setProjectAnnotations } from '@storybook/react-vite'; // Adjust based on your framework
import * as projectAnnotations from './preview';
import * as a11yAnnotations from '@storybook/addon-a11y/preview';

setProjectAnnotations([projectAnnotations, a11yAnnotations]);
