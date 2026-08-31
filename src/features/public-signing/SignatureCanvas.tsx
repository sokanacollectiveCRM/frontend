import { Button } from '@/common/components/ui/button';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SIGNATURE_BYTES = 256 * 1024;
const MIN_CANVAS_WIDTH = 160;

function dataUrlBytes(dataUrl: string): number {
  const encoded = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0;
  return Math.floor((encoded.length * 3) / 4) - padding;
}

export function exportSignaturePng(source: HTMLCanvasElement): string {
  let canvas = source;
  let dataUrl = canvas.toDataURL('image/png');

  while (
    dataUrlBytes(dataUrl) > MAX_SIGNATURE_BYTES &&
    canvas.width > MIN_CANVAS_WIDTH
  ) {
    const resized = document.createElement('canvas');
    resized.width = Math.max(MIN_CANVAS_WIDTH, Math.floor(canvas.width * 0.75));
    resized.height = Math.max(50, Math.floor(canvas.height * 0.75));
    const context = resized.getContext('2d');
    if (!context) throw new Error('Drawing is unavailable in this browser.');
    context.drawImage(canvas, 0, 0, resized.width, resized.height);
    canvas = resized;
    dataUrl = canvas.toDataURL('image/png');
  }

  if (dataUrlBytes(dataUrl) > MAX_SIGNATURE_BYTES) {
    throw new Error('The drawn signature is too large. Please draw it again.');
  }
  return dataUrl;
}

interface SignatureCanvasProps {
  onChange: (dataUrl: string | null) => void;
  onError: (message: string | null) => void;
}

export function SignatureCanvas({ onChange, onError }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [empty, setEmpty] = useState(true);

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(bounds.width * scale));
    canvas.height = Math.max(1, Math.floor(bounds.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2.5;
    context.strokeStyle = '#111827';
    hasInk.current = false;
    setEmpty(true);
    onChange(null);
  }, [onChange]);

  useEffect(() => {
    prepareCanvas();
    const observer = new ResizeObserver(prepareCanvas);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [prepareCanvas]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const next = point(event);
    context.beginPath();
    context.moveTo(next.x, next.y);
    context.lineTo(next.x + 0.01, next.y + 0.01);
    context.stroke();
    drawing.current = true;
    hasInk.current = true;
    setEmpty(false);
    onError(null);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    event.preventDefault();
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const next = point(event);
    context.lineTo(next.x, next.y);
    context.stroke();
  };

  const finish = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!hasInk.current) return;
    try {
      onChange(exportSignaturePng(event.currentTarget));
      onError(null);
    } catch (error) {
      onChange(null);
      onError(
        error instanceof Error ? error.message : 'Could not save the drawing.'
      );
    }
  };

  return (
    <div className='space-y-2'>
      <canvas
        ref={canvasRef}
        role='img'
        aria-label='Draw your signature'
        className='h-44 w-full touch-none rounded-md border bg-white'
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <div className='flex items-center justify-between gap-3'>
        <p className='text-xs text-muted-foreground'>
          Draw with your finger, mouse, or stylus.
        </p>
        <Button
          type='button'
          size='sm'
          variant='outline'
          disabled={empty}
          onClick={prepareCanvas}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
