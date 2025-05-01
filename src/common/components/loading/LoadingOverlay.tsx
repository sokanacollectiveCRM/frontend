import { useEffect, useState } from 'react';

type LoadingOverlayProps = {
  isLoading: boolean;
  delay?: number; // optional fade-out delay in ms
};

export function LoadingOverlay({ isLoading, delay = 500 }: LoadingOverlayProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => setShow(false), delay);
      return () => clearTimeout(timeout);
    } else {
      setShow(true);
    }
  }, [isLoading, delay]);

  if (!show) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
}