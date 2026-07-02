import '@/index.css'
import React from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import AboutPage from '@/components/About'
import { ProgramListPage } from '@/pages/ProgramListPage'
import { ProgramPlaceholderPage } from '@/pages/ProgramPlaceholderPage'

const AppWrapper = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<ProgramListPage />} />
                <Route
                    path="/programs/:programId"
                    element={<ProgramPlaceholderPage />}
                />
                <Route path="/about" element={<AboutPage />} />
            </Routes>
        </HashRouter>
    )
}

export default AppWrapper
