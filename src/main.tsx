import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import Transfers from './pages/Transfers.tsx'
import { AppProvider } from './context/AppContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/transfers" element={<Transfers />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
)
