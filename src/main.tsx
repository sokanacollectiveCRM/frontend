import App from '@/App'
import { HeroUIProvider } from '@heroui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>,
)
