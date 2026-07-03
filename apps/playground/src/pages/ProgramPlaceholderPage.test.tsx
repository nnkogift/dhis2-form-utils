import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ProgramEventFormScreen } from '@/components/programs/forms/ProgramEventFormScreen'
import { ProgramRegistrationFormScreen } from '@/components/programs/forms/ProgramRegistrationFormScreen'
import { useAccessibleOrgUnits } from '@/hooks/useAccessibleOrgUnits'
import { useEventProgramMetadata } from '@/hooks/useEventProgramMetadata'
import { ProgramPlaceholderPage } from './ProgramPlaceholderPage'

jest.mock('@/hooks/useEventProgramMetadata')
jest.mock('@/hooks/useAccessibleOrgUnits')
jest.mock('@/components/programs/forms/ProgramEventFormScreen', () => ({
    ProgramEventFormScreen: jest.fn(() => <div>Event form screen</div>),
}))
jest.mock('@/components/programs/forms/ProgramRegistrationFormScreen', () => ({
    ProgramRegistrationFormScreen: jest.fn(() => (
        <div>Registration form screen</div>
    )),
}))

const mockedUseEventProgramMetadata = jest.mocked(useEventProgramMetadata)
const mockedUseAccessibleOrgUnits = jest.mocked(useAccessibleOrgUnits)

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/programs/Program12345']}>
            <Routes>
                <Route
                    path="/programs/:programId"
                    element={<ProgramPlaceholderPage />}
                />
            </Routes>
        </MemoryRouter>
    )
}

describe('ProgramPlaceholderPage', () => {
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
        mockedUseEventProgramMetadata.mockReturnValue({
            data: {
                program: {
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
            },
            error: undefined,
            loading: false,
            fetching: false,
            called: true,
            refetch: jest.fn(),
            engine: {} as never,
        })

        const view = renderPage()

        expect(view.getByText('Event form screen')).toBeTruthy()
        expect(ProgramEventFormScreen).toHaveBeenCalled()
    })

    it('renders the registration flow for tracker programs', () => {
        mockedUseEventProgramMetadata.mockReturnValue({
            data: {
                program: {
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
            },
            error: undefined,
            loading: false,
            fetching: false,
            called: true,
            refetch: jest.fn(),
            engine: {} as never,
        })

        const view = renderPage()

        expect(view.getByText('Registration form screen')).toBeTruthy()
        expect(ProgramRegistrationFormScreen).toHaveBeenCalled()
    })

    it('shows a notice when no organisation units are available', () => {
        mockedUseEventProgramMetadata.mockReturnValue({
            data: {
                program: {
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
            },
            error: undefined,
            loading: false,
            fetching: false,
            called: true,
            refetch: jest.fn(),
            engine: {} as never,
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
