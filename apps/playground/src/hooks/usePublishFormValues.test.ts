import { act, renderHook } from '@testing-library/react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { usePublishFormValues } from './usePublishFormValues'

type SubscribeCallback = (arg: { values: Record<string, unknown> }) => void

function createFakeForm(initialValues: Record<string, unknown>) {
    let subscribedCallback: SubscribeCallback | undefined
    const unsubscribe = jest.fn()
    const form = {
        getValues: jest.fn(() => initialValues),
        subscribe: jest.fn((options: { callback: SubscribeCallback }) => {
            subscribedCallback = options.callback
            return unsubscribe
        }),
    } as unknown as UseFormReturn<FieldValues>

    return {
        form,
        unsubscribe,
        emit: (values: Record<string, unknown>) =>
            subscribedCallback?.({ values }),
    }
}

describe('usePublishFormValues', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('publishes the initial values synchronously on mount', () => {
        const { form } = createFakeForm({ age: '25' })
        const onValuesChange = jest.fn()

        renderHook(() => {
            usePublishFormValues(form, onValuesChange)
        })

        expect(onValuesChange).toHaveBeenCalledTimes(1)
        expect(onValuesChange).toHaveBeenCalledWith({ age: '25' })
    })

    it('debounces subsequent value changes by 150ms', () => {
        const { form, emit } = createFakeForm({ age: '25' })
        const onValuesChange = jest.fn()

        renderHook(() => {
            usePublishFormValues(form, onValuesChange)
        })
        onValuesChange.mockClear()

        act(() => {
            emit({ age: '26' })
        })
        expect(onValuesChange).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(149)
        })
        expect(onValuesChange).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(onValuesChange).toHaveBeenCalledTimes(1)
        expect(onValuesChange).toHaveBeenCalledWith({ age: '26' })
    })

    it('collapses rapid changes within the debounce window into one call', () => {
        const { form, emit } = createFakeForm({ age: '25' })
        const onValuesChange = jest.fn()

        renderHook(() => {
            usePublishFormValues(form, onValuesChange)
        })
        onValuesChange.mockClear()

        act(() => {
            emit({ age: '26' })
            jest.advanceTimersByTime(50)
            emit({ age: '27' })
            jest.advanceTimersByTime(150)
        })

        expect(onValuesChange).toHaveBeenCalledTimes(1)
        expect(onValuesChange).toHaveBeenCalledWith({ age: '27' })
    })

    it('clears the pending timer and unsubscribes on unmount', () => {
        const { form, emit, unsubscribe } = createFakeForm({ age: '25' })
        const onValuesChange = jest.fn()

        const { unmount } = renderHook(() => {
            usePublishFormValues(form, onValuesChange)
        })
        onValuesChange.mockClear()

        act(() => {
            emit({ age: '26' })
        })
        unmount()

        act(() => {
            jest.advanceTimersByTime(150)
        })

        expect(onValuesChange).not.toHaveBeenCalled()
        expect(unsubscribe).toHaveBeenCalledTimes(1)
    })

    it('does nothing when onValuesChange is not provided', () => {
        const { form } = createFakeForm({ age: '25' })

        expect(() => {
            renderHook(() => {
                usePublishFormValues(form, undefined)
            })
        }).not.toThrow()
        expect(form.subscribe).not.toHaveBeenCalled()
    })
})
