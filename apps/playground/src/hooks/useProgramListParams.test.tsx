import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useProgramListParams } from './useProgramListParams'

function ParamsProbe() {
    const { search, type, page, setSearch, setType } = useProgramListParams()

    return (
        <div>
            <span data-testid="search">{search}</span>
            <span data-testid="type">{type}</span>
            <span data-testid="page">{page}</span>
            <button
                type="button"
                data-testid="set-search"
                onClick={() => {
                    setSearch('anc')
                }}
            >
                search
            </button>
            <button
                type="button"
                data-testid="set-type"
                onClick={() => {
                    setType('registration')
                }}
            >
                type
            </button>
        </div>
    )
}

function renderParamsProbe(initialEntry = '/') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/" element={<ParamsProbe />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('useProgramListParams', () => {
    it('reads page from the URL', () => {
        const { getByTestId } = renderParamsProbe('/?page=2')

        expect(getByTestId('page').textContent).toBe('2')
    })

    it('resets page when search changes', () => {
        const { getByTestId } = renderParamsProbe('/?page=2')

        fireEvent.click(getByTestId('set-search'))

        expect(getByTestId('search').textContent).toBe('anc')
        expect(getByTestId('page').textContent).toBe('1')
    })

    it('resets page when type changes', () => {
        const { getByTestId } = renderParamsProbe('/?page=3')

        fireEvent.click(getByTestId('set-type'))

        expect(getByTestId('type').textContent).toBe('registration')
        expect(getByTestId('page').textContent).toBe('1')
    })
})
