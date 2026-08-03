import { buildProgramFilters } from './buildProgramFilters'

describe('buildProgramFilters', () => {
    it('returns no filters when search is empty and type is all', () => {
        expect(buildProgramFilters('', 'all')).toEqual([])
    })

    it('adds identifiable token filter for search text', () => {
        expect(buildProgramFilters('ANC visit', 'all')).toEqual([
            'identifiable:token:ANC visit',
        ])
    })

    it('trims search before building identifiable token filter', () => {
        expect(buildProgramFilters('  anc  ', 'all')).toEqual([
            'identifiable:token:anc',
        ])
    })

    it('adds programType filter for registration programs', () => {
        expect(buildProgramFilters('', 'registration')).toEqual([
            'programType:eq:WITH_REGISTRATION',
        ])
    })

    it('adds programType filter for event programs', () => {
        expect(buildProgramFilters('', 'event')).toEqual([
            'programType:eq:WITHOUT_REGISTRATION',
        ])
    })

    it('combines search and program type filters', () => {
        expect(buildProgramFilters('child', 'registration')).toEqual([
            'identifiable:token:child',
            'programType:eq:WITH_REGISTRATION',
        ])
    })
})
