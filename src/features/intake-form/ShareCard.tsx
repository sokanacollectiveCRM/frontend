import { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';

import { Button } from '@/common/components/ui/button';

import { liveLogoUrl } from './api';

export function IntakeShareCard({
  orgName,
  slug,
  intakeEnabled,
  liveVersion,
  tenantId,
}: {
  orgName: string;
  slug: string;
  intakeEnabled: boolean;
  liveVersion: number | null;
  tenantId?: string | null;
}) {
  const url = `${window.location.origin}/request/${slug}`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [png, setPng] = useState<Blob | null>(null);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!intakeEnabled) return;
    let cancelled = false;
    let objectUrl = '';
    void (async () => {
      try {
        const card = await renderShareCard({
          orgName,
          url,
          logoUrl: liveLogoUrl(tenantId),
          fallbackLogoUrl: '/sokana360-logo.png',
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(card.png);
        setPreviewUrl(objectUrl);
        setPng(card.png);
        setPdf(card.pdf);
      } catch {
        if (!cancelled) setError('The share card could not be prepared.');
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [intakeEnabled, orgName, url, tenantId]);

  if (!intakeEnabled) {
    return (
      <p>
        The public intake link is off for this organization. Copy and the QR
        code stay hidden until intake is turned on.
      </p>
    );
  }

  return (
    <section>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .intake-share-print, .intake-share-print * { visibility: visible; }
          .intake-share-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
        }
      `}</style>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Share</h2>
      {liveVersion == null ? (
        <p style={{ marginBottom: 12 }}>
          This link opens the current public form. It will use this draft after
          you publish.
        </p>
      ) : (
        <p style={{ marginBottom: 12 }}>Live is version {liveVersion}.</p>
      )}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <code style={{ flex: 1, overflow: 'auto' }}>{url}</code>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            void navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>
      {error ? <p>{error}</p> : null}
      {previewUrl ? (
        <div className='intake-share-print' style={{ background: 'white' }}>
          <img
            src={previewUrl}
            alt={`QR code for ${orgName} request for service`}
            style={{ width: 220, maxWidth: '100%', background: 'white' }}
          />
        </div>
      ) : (
        <p>Preparing the QR card…</p>
      )}
      <div
        className='intake-share-actions'
        style={{ display: 'flex', gap: 8, marginTop: 12 }}
      >
        <Button
          type='button'
          variant='outline'
          onClick={() => window.print()}
          disabled={!png}
        >
          Print
        </Button>
        <Button
          type='button'
          variant='outline'
          disabled={!png}
          onClick={() => png && downloadBlob(png, `${slug}-intake-qr.png`)}
        >
          Download PNG
        </Button>
        <Button
          type='button'
          variant='outline'
          disabled={!pdf}
          onClick={() => pdf && downloadBlob(pdf, `${slug}-intake-qr.pdf`)}
        >
          Download PDF
        </Button>
      </div>
    </section>
  );
}

async function renderShareCard(input: {
  orgName: string;
  url: string;
  logoUrl: string;
  fallbackLogoUrl: string;
}): Promise<{ png: Blob; pdf: Blob }> {
  const qr = document.createElement('canvas');
  await QRCode.toCanvas(qr, input.url, {
    errorCorrectionLevel: 'H',
    margin: 4,
    width: 1024,
    color: { dark: '#000000', light: '#ffffff' },
  });
  const logo =
    (await loadLogo(input.logoUrl)) ?? (await loadLogo(input.fallbackLogoUrl));
  const page = document.createElement('canvas');
  page.width = 1275;
  page.height = 1650;
  const ctx = page.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, page.width, page.height);
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  let y = 72;
  if (logo) {
    const maxW = 420;
    const maxH = 160;
    const scale = Math.min(maxW / logo.width, maxH / logo.height, 1);
    const width = logo.width * scale;
    const height = logo.height * scale;
    ctx.drawImage(logo, (page.width - width) / 2, y, width, height);
    y += height + 28;
  }
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(input.orgName, page.width / 2, y + 40);
  y += 64;
  ctx.font = '28px sans-serif';
  ctx.fillText('Request for service', page.width / 2, y);
  y += 36;
  const qrSize = 1024;
  ctx.drawImage(qr, (page.width - qrSize) / 2, y, qrSize, qrSize);
  y += qrSize + 40;
  ctx.font = '22px sans-serif';
  wrapText(ctx, input.url, page.width / 2, y, page.width - 120, 30);
  const png = await new Promise<Blob>((resolve, reject) => {
    page.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG failed'))),
      'image/png'
    );
  });
  const pdf = await PDFDocument.create();
  const pdfPage = pdf.addPage([612, 792]);
  const image = await pdf.embedPng(await png.arrayBuffer());
  const scale = Math.min(612 / image.width, 792 / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  pdfPage.drawImage(image, {
    x: (612 - width) / 2,
    y: (792 - height) / 2,
    width,
    height,
  });
  const bytes = await pdf.save();
  return { png, pdf: new Blob([bytes], { type: 'application/pdf' }) };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split('');
  let line = '';
  let cursor = y;
  for (const char of words) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, cursor);
      line = char;
      cursor += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
}

async function loadLogo(url: string): Promise<HTMLImageElement | null> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) return null;
  const blob = await response.blob();
  if (!blob.size) return null;
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('logo'));
      image.src = objectUrl;
    });
    return image;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
