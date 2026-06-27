import '@fontsource-variable/inter'
import './styles/fonts'
import './styles/tokens.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { preloadFonts } from './styles/fonts'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Aquece o cache de fontes em segundo plano (não bloqueia o boot).
preloadFonts()
