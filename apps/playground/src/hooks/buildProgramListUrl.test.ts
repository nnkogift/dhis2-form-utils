import {
    buildProgramListUrl,
    DEFAULT_PAGE_SIZE,
    parsePageSize,
    parseProgramTypeFilter,
} from './buildProgramListUrl'

describe('buildProgramListUrl', () => {
    it('returns root path when params are defaults', () => {
        expect(
            buildProgramListUrl({
                search: '',
                type: 'all',
                page: 1,
                pageSize: DEFAULT_PAGE_SIZE,
            })
        ).toBe('/')
    })

    it('serializes search, type, page, and page size', () => {
        expect(
            buildProgramListUrl({
                search: 'anc',
                type: 'registration',
                page: 2,
                pageSize: 50,
            })
        ).toBe('/?search=anc&type=registration&page=2&pageSize=50')
    })
})

describe('parsePageSize', () => {
    it('returns default for missing or invalid values', () => {
        expect(parsePageSize(null)).toBe(DEFAULT_PAGE_SIZE)
        expect(parsePageSize('25')).toBe(DEFAULT_PAGE_SIZE)
        expect(parsePageSize('invalid')).toBe(DEFAULT_PAGE_SIZE)
    })

    it('returns valid page size options', () => {
        expect(parsePageSize('10')).toBe(10)
        expect(parsePageSize('50')).toBe(50)
    })
})

describe('parseProgramTypeFilter', () => {
    it('returns all for unknown values', () => {
        expect(parseProgramTypeFilter(null)).toBe('all')
        expect(parseProgramTypeFilter('invalid')).toBe('all')
    })

    it('returns registration and event values', () => {
        expect(parseProgramTypeFilter('registration')).toBe('registration')
        expect(parseProgramTypeFilter('event')).toBe('event')
    })
})
