/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    title: 'Program Rules Playground',
    entryPoints: {
        app: './src/AppWrapper.tsx',
    },
    minDHIS2Version: '2.40',
    maxDHIS2Version: '2.43',
    description:
        'An app to view, test and debug program rules in your DHIS2 instance',
    author: 'Gift Nnko<nnkogift@gmail.com>',
    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
