import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useEventProgramMetadataQuery } from '@dhis2-form-utils/hooks'
import { ProgramStageFormScreen } from '@/components/programs/forms/ProgramStageFormScreen'
import { TrackerProgramShell } from '@/components/programs/forms/TrackerProgramShell'
import { useAccessibleOrgUnits } from '@/hooks/useAccessibleOrgUnits'
import { ProgramPage } from './ProgramPage'

jest.mock('@dhis2-form-utils/hooks', () => ({
    useEventProgramMetadataQuery: jest.fn(),
}))
jest.mock('@/hooks/useAccessibleOrgUnits')
jest.mock('@/components/programs/forms/ProgramStageFormScreen', () => ({
    ProgramStageFormScreen: jest.fn(() => <div>Event form screen</div>),
}))
jest.mock('@/components/programs/forms/TrackerProgramShell', () => ({
    TrackerProgramShell: jest.fn(() => <div>Registration form screen</div>),
}))

const mockedUseEventProgramMetadataQuery = jest.mocked(
    useEventProgramMetadataQuery
)
const mockedUseAccessibleOrgUnits = jest.mocked(useAccessibleOrgUnits)

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/programs/Program12345']}>
            <Routes>
                <Route path="/programs/:programId" element={<ProgramPage />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('ProgramPage', () => {
    beforeEach(() => {
        mockedUseAccessibleOrgUnits.mockReturnValue({
            data: undefined,
            error: undefined,
            loading: false,
            fetching: false,
            called: true,
            orgUnits: [{ id: 'OrgUnit12345', displayName: 'Ngelehun CHC' }],
            refetch: jest.fn(),
            engine: {} as never,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the event form flow for event programs', () => {
        mockedUseEventProgramMetadataQuery.mockReturnValue({
            metadata: {
                id: 'Program12345',
                displayName: 'Inpatient morbidity',
                code: 'IPM',
                shortName: 'IPM',
                programType: 'WITHOUT_REGISTRATION',
                programStages: [
                    {
                        id: 'Stage1234567',
                        displayName: 'Stage 1',
                        programStageDataElements: [],
                    },
                ],
                programRules: [],
                programRuleVariables: [],
            },
            error: undefined,
            loading: false,
        })

        const view = renderPage()

        expect(view.getByText('Event form screen')).toBeTruthy()
        expect(ProgramStageFormScreen).toHaveBeenCalled()
    })

    it('renders the registration flow for tracker programs', () => {
        mockedUseEventProgramMetadataQuery.mockReturnValue({
            metadata: {
                id: 'Program12345',
                displayName: 'Child registration',
                code: 'CHILD',
                shortName: 'CHILD',
                programType: 'WITH_REGISTRATION',
                programStages: [
                    {
                        id: 'Stage1234567',
                        displayName: 'Stage 1',
                        programStageDataElements: [],
                    },
                ],
                programRules: [],
                programRuleVariables: [],
            },
            error: undefined,
            loading: false,
        })

        const view = renderPage()

        expect(view.getByText('Registration form screen')).toBeTruthy()
        expect(TrackerProgramShell).toHaveBeenCalled()
    })

    it('shows a notice when no organisation units are available', () => {
        mockedUseEventProgramMetadataQuery.mockReturnValue({
            metadata: {
                id: 'Program12345',
                displayName: 'Child registration',
                code: 'CHILD',
                shortName: 'CHILD',
                programType: 'WITH_REGISTRATION',
                programStages: [
                    {
                        id: 'Stage1234567',
                        displayName: 'Stage 1',
                        programStageDataElements: [],
                    },
                ],
                programRules: [],
                programRuleVariables: [],
            },
            error: undefined,
            loading: false,
        })
        mockedUseAccessibleOrgUnits.mockReturnValue({
            data: undefined,
            error: undefined,
            loading: false,
            fetching: false,
            called: true,
            orgUnits: [],
            refetch: jest.fn(),
            engine: {} as never,
        })

        const view = renderPage()

        expect(
            view.getByText(/does not have any accessible organisation units/i)
        ).toBeTruthy()
    })
})
