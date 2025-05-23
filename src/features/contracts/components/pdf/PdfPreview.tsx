import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { Badge } from '@/common/components/ui/badge'
import { ScrollArea } from '@/common/components/ui/scroll-area'
import { Separator } from '@/common/components/ui/separator'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useTemplatesContext } from '../../contexts/TemplatesContext'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export function PdfPreview() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { selectedTemplateName } = useTemplatesContext();

  useEffect(() => {
    const fetchPdf = async () => {
      setIsLoading(true)
      try {
        console.log(selectedTemplateName)
        const token = localStorage.getItem('authToken')
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/contracts/templates/generate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: selectedTemplateName,
            fields: {
              clientname: 'CLIENT_NAME',
              deposit: 'DEPOSIT',
            },
          }),
        })

        if (!res.ok) throw new Error('PDF preview fetch failed')

        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        setPdfUrl(objectUrl)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdf()
  }, [selectedTemplateName])

  return (
    <div className="relative w-full">
      <LoadingOverlay isLoading={isLoading} />

      <div className="flex items-center justify-between px-4 py-2 bg-white border rounded-t-md">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Template:</span>
          <Badge variant="outline">{selectedTemplateName}</Badge>
        </div>
        {numPages && (
          <div className="text-muted-foreground text-sm">
            Pages: <span className="font-semibold">{numPages}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="border border-t-0 rounded-b-md max-h-[600px] h-[600px] w-full overflow-hidden bg-muted">
        <ScrollArea className="h-full w-full px-4 py-2">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading=""
            >
              <div className="flex flex-col items-center gap-6 py-4">
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <Page
                    key={i}
                    pageNumber={i + 1}
                    width={480}
                    className="shadow rounded"
                    renderAnnotationLayer={false}
                    renderTextLayer={true}
                  />
                ))}
              </div>
            </Document>
          ) : (
            <p className="text-muted-foreground">No PDF to show</p>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}