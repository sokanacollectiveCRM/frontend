import { Search } from '@/common/components/header/Search'
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import UsersProvider from '@/common/contexts/UsersContext'
import { useUser } from '@/common/hooks/user/useUser'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { useState } from 'react'
import { Viewport } from './components/common/Viewport'

const dummyTemplates = [
  { id: 1, name: 'NDA Template' },
  { id: 2, name: 'Employment Offer' },
  { id: 3, name: 'Freelancer Agreement' },
  { id: 4, name: 'Partnership Terms' },
  { id: 5, name: 'Contractor Agreement' },
  { id: 6, name: 'Internship Offer' },
  { id: 7, name: 'Consulting Agreement' },
  { id: 8, name: 'Lease Agreement' },
  { id: 9, name: 'Sales Agreement' },
]

export default function EditTemplate() {
  const { isLoading: userLoading } = useUser();
  const [uploading, setUploading] = useState(false);
  const [contractName, setContractName] = useState<string>('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('contract', file);
    formData.append('name', contractName);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/contracts/templates`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      console.log('Uploaded:', result)
    } catch (err) {
      console.error(err)
    }
  }

  const handleGenerate = async () => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/contracts/templates/generate?download=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'LaborSupport.docx',
        fields: {
          clientname: 'Jane Smith',
          deposit: '$500',
        },
      }),
    })

    if (!res.ok) {
      console.error('Generation failed')
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contract.pdf'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <LoadingOverlay isLoading={userLoading} />

      <Main>
        <div className="flex-1 overflow-auto p-4">
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Contracts</h2>
              <p className='text-muted-foreground'>
                Create or edit a template below.
              </p>
            </div>
          </div>

          {/* <input
            type="text"
            placeholder="Contract name"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            className="mb-2 block border px-2 py-1"
          />
          <input type='file' accept='.docx' onChange={handleUpload} disabled={uploading} />
          <Button onClick={handleGenerate}>
            Generate Contract
          </Button> */}

          <Viewport />
        </div>
      </Main>

    </UsersProvider >
  )
}


