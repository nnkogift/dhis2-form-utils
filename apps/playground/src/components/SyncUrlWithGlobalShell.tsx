import { useLocation } from 'react-router'
import { useEffect } from 'react'

export const SyncUrlWithGlobalShell = ({
    children,
}: {
    children?: React.ReactNode
}) => {
    const location = useLocation()

    useEffect(() => {
        dispatchEvent(new PopStateEvent('popstate'))
    }, [location.key])

    return children
}
