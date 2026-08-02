import { renderHook } from '@testing-library/react'
import { useDataQuery } from '@dhis2/app-runtime'
import { useCurrentUserSupplementaryData } from './useCurrentUserSupplementaryData'

jest.mock('@dhis2/app-runtime', () => ({
    useDataQuery: jest.fn(),
}))

const mockedUseDataQuery = jest.mocked(useDataQuery)

describe('useCurrentUserSupplementaryData', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('returns undefined while data has not resolved', () => {
        mockedUseDataQuery.mockReturnValue({ data: undefined } as never)

        const { result } = renderHook(() => useCurrentUserSupplementaryData())

        expect(result.current).toBeUndefined()
    })

    it('maps userGroups/userRoles to id arrays', () => {
        mockedUseDataQuery.mockReturnValue({
            data: {
                me: {
                    userGroups: [{ id: 'UserGroup1' }, { id: 'UserGroup2' }],
                    userRoles: [{ id: 'UserRole1' }],
                },
            },
        } as never)

        const { result } = renderHook(() => useCurrentUserSupplementaryData())

        expect(result.current).toEqual({
            userGroups: ['UserGroup1', 'UserGroup2'],
            userRoles: ['UserRole1'],
        })
    })

    it('defaults to empty arrays when userGroups/userRoles are absent', () => {
        mockedUseDataQuery.mockReturnValue({ data: { me: {} } } as never)

        const { result } = renderHook(() => useCurrentUserSupplementaryData())

        expect(result.current).toEqual({ userGroups: [], userRoles: [] })
    })

    it('returns a stable reference across re-renders when data is unchanged', () => {
        const data = {
            me: { userGroups: [{ id: 'UserGroup1' }], userRoles: [] },
        }
        mockedUseDataQuery.mockReturnValue({ data } as never)

        const { result, rerender } = renderHook(() =>
            useCurrentUserSupplementaryData()
        )
        const first = result.current
        rerender()

        expect(result.current).toBe(first)
    })
})
