import { useEffect, useRef } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

const DEBOUNCE_MS = 150

/** Uses RHF's low-level `form.subscribe` (not `form.watch`) so this can be debounced independently of FormStore's own evaluation loop. */
export function usePublishFormValues<FormValue extends FieldValues>(
    form: UseFormReturn<FormValue>,
    onValuesChange?: (values: Record<string, unknown>) => void
) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => {
        if (!onValuesChange) {
            return
        }

        onValuesChange({ ...form.getValues() })

        const unsubscribe = form.subscribe({
            formState: { values: true },
            callback: ({ values }) => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                }
                timeoutRef.current = setTimeout(() => {
                    onValuesChange({ ...values })
                }, DEBOUNCE_MS)
            },
        })

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            unsubscribe()
        }
    }, [form, onValuesChange])
}
