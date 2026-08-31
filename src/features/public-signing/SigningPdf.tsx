import { buildUrl } from '@/api/http';
import {
  appliedFieldTextStyle,
  fieldBoxClasses,
  initialsStyle,
  signingDateStyle,
  typedSignatureStyle,
} from '@/features/public-signing/signingDisplay';
import {
  displaySigningDate,
  fieldActionLabel,
  fieldTagLabel,
  floorRenderedPageSize,
  overlayStylePx,
} from '@/features/public-signing/signingFields';
import type {
  SignatureValue,
  SigningManifestField,
} from '@/features/public-signing/types';
import { Check, ChevronDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface SigningPdfProps {
  pdfUrl: string;
  fields: readonly SigningManifestField[];
  adoptedSignature: SignatureValue | null;
  adoptedInitials: string;
  appliedFieldIds: ReadonlySet<string>;
  activeFieldId: string | null;
  guidedMode: boolean;
  onFieldActivate: (fieldId: string) => void;
  onLoadFailure: () => void;
  onLoadSuccess: () => void;
}

interface PageDimensions {
  width: number;
  height: number;
}

function FieldTag({
  field,
  active,
  applied,
  guidedMode,
}: {
  field: SigningManifestField;
  active: boolean;
  applied: boolean;
  guidedMode: boolean;
}) {
  // Initial fields are often tightly grouped on consecutive financial lines.
  // Their floating tags overlap each other and the contract copy, so rely on
  // the highlighted field box and guided controls instead.
  if (applied || field.kind === 'initials') return null;

  const tagLabel = fieldTagLabel(field.kind);
  const tagTone = active
    ? 'bg-yellow-400 text-slate-900 shadow-md ring-2 ring-yellow-600'
    : 'bg-yellow-300 text-slate-900 shadow-sm ring-1 ring-yellow-600';

  return (
    <span
      className={`pointer-events-none absolute bottom-full left-0 z-20 mb-1 flex max-w-none items-center gap-1 whitespace-nowrap rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${tagTone}`}
      aria-hidden='true'
    >
      {active && guidedMode && (
        <ChevronDown className='size-3 shrink-0 animate-bounce' />
      )}
      {tagLabel}
      {active && guidedMode && (
        <span className='hidden font-medium normal-case tracking-normal sm:inline'>
          — {fieldActionLabel(field.kind)}
        </span>
      )}
      <span className='absolute left-3 top-full h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-yellow-400' />
    </span>
  );
}

function FieldOverlay({
  field,
  pageSize,
  adoptedSignature,
  adoptedInitials,
  applied,
  active,
  guidedMode,
  onActivate,
  overlayRef,
}: {
  field: SigningManifestField;
  pageSize: PageDimensions;
  adoptedSignature: SignatureValue | null;
  adoptedInitials: string;
  applied: boolean;
  active: boolean;
  guidedMode: boolean;
  onActivate: () => void;
  overlayRef: (element: HTMLButtonElement | null) => void;
}) {
  if (field.kind === 'snapshot_text') return null;

  const wrapperStyle = overlayStylePx(
    field.coordinates,
    pageSize.width,
    pageSize.height
  );
  const showValue = applied;
  const interactive = guidedMode && !applied;
  const appliedText = appliedFieldTextStyle();

  const fieldValue = (() => {
    if (!showValue) return null;

    switch (field.kind) {
      case 'signature':
        return adoptedSignature?.type === 'drawn' ? (
          <img
            src={adoptedSignature.dataUrl}
            alt='Your signature'
            className='h-full w-full object-contain'
          />
        ) : (
          <span
            className='block h-full w-full overflow-hidden text-ellipsis whitespace-nowrap'
            style={{
              ...typedSignatureStyle(),
              ...appliedText,
              fontFamily:
                adoptedSignature?.fontFamily ??
                typedSignatureStyle().fontFamily,
            }}
          >
            {adoptedSignature?.type === 'typed' ? adoptedSignature.text : ''}
          </span>
        );
      case 'initials':
        return (
          <span
            className='block h-full w-full overflow-hidden text-center text-ellipsis whitespace-nowrap'
            style={{ ...initialsStyle(), ...appliedText }}
          >
            {adoptedInitials}
          </span>
        );
      case 'signing_date':
        return (
          <span
            className='block h-full w-full overflow-hidden text-ellipsis whitespace-nowrap'
            style={{ ...signingDateStyle(), ...appliedText }}
          >
            {displaySigningDate()}
          </span>
        );
      case 'acknowledgment':
        return (
          <span className='flex h-full w-full items-center justify-center'>
            <Check className='size-3.5 text-slate-900' aria-hidden='true' />
            <span className='sr-only'>Acknowledged</span>
          </span>
        );
      default:
        return null;
    }
  })();

  return (
    <div className='absolute z-10 box-border' style={wrapperStyle}>
      <FieldTag
        field={field}
        active={active}
        applied={applied}
        guidedMode={guidedMode}
      />
      <button
        ref={overlayRef}
        type='button'
        data-field-id={field.id}
        className={`absolute inset-0 box-border overflow-hidden p-0 transition-colors ${fieldBoxClasses(applied, active, guidedMode)} ${interactive ? 'pointer-events-auto cursor-pointer hover:bg-yellow-300' : 'pointer-events-none cursor-default'}`}
        title={field.label || fieldTagLabel(field.kind)}
        aria-label={
          applied
            ? `${field.label || fieldTagLabel(field.kind)} completed`
            : active
              ? `${fieldActionLabel(field.kind)}: ${field.label || fieldTagLabel(field.kind)}`
              : `${fieldTagLabel(field.kind)}: ${field.label || field.kind}`
        }
        aria-current={active ? 'step' : undefined}
        disabled={!interactive}
        onClick={() => {
          if (interactive) onActivate();
        }}
      >
        {applied && (
          <Check
            className='absolute right-0.5 top-0.5 size-2.5 rounded-full bg-emerald-600 p-0.5 text-white'
            aria-hidden='true'
          />
        )}
        <span className='flex h-full w-full items-center justify-center px-0.5'>
          {fieldValue}
        </span>
      </button>
    </div>
  );
}

function SigningPdfPage({
  pageNumber,
  width,
  pageFields,
  adoptedSignature,
  adoptedInitials,
  appliedFieldIds,
  activeFieldId,
  guidedMode,
  onFieldActivate,
  fieldElements,
}: {
  pageNumber: number;
  width: number;
  pageFields: readonly SigningManifestField[];
  adoptedSignature: SignatureValue | null;
  adoptedInitials: string;
  appliedFieldIds: ReadonlySet<string>;
  activeFieldId: string | null;
  guidedMode: boolean;
  onFieldActivate: (fieldId: string) => void;
  fieldElements: MutableRefObject<Map<string, HTMLButtonElement>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageSize, setPageSize] = useState<PageDimensions | null>(null);

  const syncPageSizeFromCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const next = floorRenderedPageSize(canvas.clientWidth, canvas.clientHeight);
    if (!next) return;
    setPageSize((current) =>
      current?.width === next.width && current?.height === next.height
        ? current
        : next
    );
  }, []);

  useEffect(() => {
    setPageSize(null);
  }, [width]);

  const pageLoading = (
    <div
      className='flex aspect-[8.5/11] items-center justify-center text-sm text-muted-foreground'
      aria-label={`Loading page ${pageNumber}`}
    >
      Loading page {pageNumber}…
    </div>
  );

  return (
    <div
      className='relative mx-auto overflow-visible rounded-sm bg-white shadow-lg ring-1 ring-slate-300'
      style={{ width: pageSize?.width ?? width }}
    >
      {width > 0 ? (
        <Page
          pageNumber={pageNumber}
          width={width}
          canvasRef={canvasRef}
          renderAnnotationLayer
          renderTextLayer
          onRenderSuccess={syncPageSizeFromCanvas}
          loading={pageLoading}
        >
          {pageSize && pageFields.length > 0 && (
            <div
              className='pointer-events-none absolute inset-0 z-10'
              aria-hidden={false}
            >
              {pageFields.map((field) => (
                <FieldOverlay
                  key={field.id}
                  field={field}
                  pageSize={pageSize}
                  adoptedSignature={adoptedSignature}
                  adoptedInitials={adoptedInitials}
                  applied={appliedFieldIds.has(field.id)}
                  active={activeFieldId === field.id}
                  guidedMode={guidedMode}
                  onActivate={() => onFieldActivate(field.id)}
                  overlayRef={(element) => {
                    if (element) fieldElements.current.set(field.id, element);
                    else fieldElements.current.delete(field.id);
                  }}
                />
              ))}
            </div>
          )}
        </Page>
      ) : (
        pageLoading
      )}
    </div>
  );
}

export function SigningPdf({
  pdfUrl,
  fields,
  adoptedSignature,
  adoptedInitials,
  appliedFieldIds,
  activeFieldId,
  guidedMode,
  onFieldActivate,
  onLoadFailure,
  onLoadSuccess,
}: SigningPdfProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldElements = useRef(new Map<string, HTMLButtonElement>());
  const [pageCount, setPageCount] = useState(0);
  const [width, setWidth] = useState(0);
  const resolvedPdfUrl = pdfUrl.startsWith('/') ? buildUrl(pdfUrl) : pdfUrl;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () =>
      setWidth(Math.max(280, Math.floor(element.clientWidth)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!guidedMode || !activeFieldId) return;
    const target = fieldElements.current.get(activeFieldId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeFieldId, guidedMode]);

  return (
    <div ref={containerRef} className='min-w-0' aria-label='Contract document'>
      <Document
        key={resolvedPdfUrl}
        file={resolvedPdfUrl}
        loading={
          <div className='rounded-lg border bg-white p-10 text-center text-sm text-muted-foreground'>
            Loading contract…
          </div>
        }
        error={
          <div className='rounded-lg border bg-white p-10 text-center text-sm text-destructive'>
            The contract preview could not be loaded. Refreshing its secure
            link…
          </div>
        }
        onLoadSuccess={({ numPages }) => {
          setPageCount(numPages);
          onLoadSuccess();
        }}
        onLoadError={onLoadFailure}
      >
        <div className='space-y-8'>
          {Array.from({ length: pageCount }, (_, index) => {
            const page = index + 1;
            return (
              <SigningPdfPage
                key={page}
                pageNumber={page}
                width={width}
                pageFields={fields.filter((field) => field.page === page)}
                adoptedSignature={adoptedSignature}
                adoptedInitials={adoptedInitials}
                appliedFieldIds={appliedFieldIds}
                activeFieldId={activeFieldId}
                guidedMode={guidedMode}
                onFieldActivate={onFieldActivate}
                fieldElements={fieldElements}
              />
            );
          })}
        </div>
      </Document>
    </div>
  );
}
