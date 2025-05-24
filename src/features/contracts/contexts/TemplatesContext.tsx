import { useTemplates } from '@/common/hooks/contracts/useTemplates'
import React, { createContext, useContext, useState } from 'react'

interface TemplatesContextType extends ReturnType<typeof useTemplates> {
  selectedTemplateName: string | null
  setSelectedTemplateName: (name: string | null) => void
}

const TemplatesContext = createContext<TemplatesContextType | null>(null)

export const TemplatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const templates = useTemplates()
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null)

  const value: TemplatesContextType = {
    ...templates,
    selectedTemplateName,
    setSelectedTemplateName,
  }

  return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>
}

export const useTemplatesContext = () => {
  const context = useContext(TemplatesContext)
  if (!context) throw new Error('useTemplates must be used within TemplatesProvider')
  return context
}
