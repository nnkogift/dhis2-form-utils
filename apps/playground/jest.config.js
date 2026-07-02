module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/jest.css.mock.js',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
}
