import type { CSSProperties } from 'react';

export const TYPED_SIGNATURE_FONT = "'Great Vibes', cursive";

export function typedSignatureStyle(): CSSProperties {
  return {
    fontFamily: TYPED_SIGNATURE_FONT,
    fontSize: 'min(1.65rem, 88%)',
    lineHeight: 1,
    color: '#0f172a',
  };
}

export function initialsStyle(): CSSProperties {
  return {
    fontSize: 'min(0.95rem, 78%)',
    lineHeight: 1,
    fontWeight: 600,
    color: '#0f172a',
    letterSpacing: '0.04em',
  };
}

export function signingDateStyle(): CSSProperties {
  return {
    fontSize: 'min(0.9rem, 72%)',
    lineHeight: 1,
    color: '#0f172a',
  };
}

export function fieldBoxClasses(
  applied: boolean,
  active: boolean,
  guidedMode: boolean
): string {
  if (applied) {
    return 'border-emerald-600 bg-emerald-100 shadow-sm ring-1 ring-emerald-400';
  }
  if (active) {
    return 'border-yellow-600 bg-yellow-300 ring-2 ring-yellow-500 shadow-md';
  }
  if (guidedMode) {
    return 'border-yellow-600 bg-yellow-200';
  }
  return 'border-yellow-600 border-dashed bg-yellow-200/95';
}

export function appliedFieldTextStyle(): CSSProperties {
  return { color: '#0f172a' };
}

export function defaultTypedSignatureValue(text: string): {
  type: 'typed';
  text: string;
  fontFamily: string;
} {
  return { type: 'typed', text, fontFamily: TYPED_SIGNATURE_FONT };
}
