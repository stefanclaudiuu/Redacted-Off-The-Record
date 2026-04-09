import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EpisodeProvider } from './context/EpisodeContext'
import { InventoryProvider } from './context/InventoryContext'
import { ObjectivesProvider } from './context/ObjectivesContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <EpisodeProvider>
        <InventoryProvider>
          <ObjectivesProvider>
            <App />
          </ObjectivesProvider>
        </InventoryProvider>
      </EpisodeProvider>
    </BrowserRouter>
  </StrictMode>,
)
