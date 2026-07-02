import { CustomDataProvider } from '@dhis2/app-runtime'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ProgramListPage } from './ProgramListPage'

it('renders program list without crashing', () => {
    render(
        <CustomDataProvider
            data={{
                programs: {
                    programs: [],
                    pager: {
                        page: 1,
                        pageCount: 0,
                        total: 0,
                        pageSize: 10,
                    },
                },
            }}
        >
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<ProgramListPage />} />
                </Routes>
            </MemoryRouter>
        </CustomDataProvider>
    )
})
