import '@/index.css'
import '@dhis2-form-utils/devtools/style.css'

import React from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import AboutPage from '@/components/About'
import { ProgramListPage } from '@/pages/ProgramListPage'
import { ProgramPlaceholderPage } from '@/pages/ProgramPlaceholderPage'
import { SyncUrlWithGlobalShell } from '@/components/SyncUrlWithGlobalShell'

const AppWrapper = () => {
    return (
        <div className="p-4 h-full">
            <HashRouter>
                <SyncUrlWithGlobalShell />
                <Routes>
                    <Route path="/" element={<ProgramListPage />} />
                    <Route
                        path="/programs/:programId"
                        element={<ProgramPlaceholderPage />}
                    />
                    <Route path="/about" element={<AboutPage />} />
                </Routes>
            </HashRouter>
        </div>
    )
}

export default AppWrapper
