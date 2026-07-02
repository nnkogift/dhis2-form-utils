import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { ProgramListTable } from './ProgramListTable'
import { PROGRAM_TYPE, type Program } from '../../types/program'

const sampleProgram: Program = {
    id: 'prog123',
    displayName: 'ANC Program',
    code: 'ANC',
    shortName: 'ANC',
    programType: PROGRAM_TYPE.WITHOUT_REGISTRATION,
}

describe('ProgramListTable', () => {
    it('calls onProgramSelect when a row is clicked', () => {
        const onProgramSelect = jest.fn()

        const { getByText } = render(
            <ProgramListTable
                programs={[sampleProgram]}
                loading={false}
                page={1}
                pageSize={10}
                onPageChange={jest.fn()}
                onPageSizeChange={jest.fn()}
                onProgramSelect={onProgramSelect}
            />
        )

        fireEvent.click(getByText('ANC Program'))

        expect(onProgramSelect).toHaveBeenCalledWith(sampleProgram)
    })
})
