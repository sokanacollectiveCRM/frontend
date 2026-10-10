import type { CSSProperties } from 'react';

const HEX6 = /^#?([0-9a-fA-F]{6})$/;

function normalizeHex(color: string): string | null {
  const trimmed = color.trim();
  const match = HEX6.exec(trimmed.startsWith('#') ? trimmed : `#${trimmed}`);
  if (!match) return null;
  return `#${match[1].toLowerCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = normalizeHex(hex) ?? '#0a3147';
  const h = n.slice(1);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Mix two hex colors; `weight` is the fraction of `b` (0–1). */
export function mixHex(a: string, b: string, weight: number): string {
  const w = Math.min(1, Math.max(0, weight));
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar * (1 - w) + br * w);
  const g = Math.round(ag * (1 - w) + bg * w);
  const bl = Math.round(ab * (1 - w) + bb * w);
  return `#${[r, g, bl].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Logo-aligned defaults for Sokana360 when API omits colors. */
export const DEFAULT_INTAKE_PRIMARY = '#0a3147';
export const DEFAULT_INTAKE_ACCENT = '#d6704d';

export function buildIntakeThemeVars(
  primaryColor: string,
  accentColor: string
): CSSProperties {
  const primary = normalizeHex(primaryColor) ?? DEFAULT_INTAKE_PRIMARY;
  const accent = normalizeHex(accentColor) ?? DEFAULT_INTAKE_ACCENT;

  return {
    '--intake-primary': primary,
    '--intake-accent': accent,
    '--intake-page-bg': mixHex('#ffffff', primary, 0.04),
    '--intake-nav-bg': mixHex('#ffffff', primary, 0.07),
    '--intake-nav-border': mixHex('#ffffff', primary, 0.16),
    '--intake-heading': primary,
    '--intake-step-current-bg': primary,
    '--intake-step-current-border': mixHex(primary, '#000000', 0.12),
    '--intake-step-completed-bg': mixHex('#ffffff', accent, 0.14),
    '--intake-step-completed-border': mixHex('#ffffff', accent, 0.5),
    '--intake-step-completed-text': mixHex(primary, accent, 0.4),
    '--intake-step-completed-badge': accent,
    '--intake-step-hover-bg': mixHex('#ffffff', accent, 0.1),
    '--intake-step-hover-border': mixHex('#ffffff', accent, 0.55),
    '--intake-focus': accent,
    '--intake-button-bg': accent,
    '--intake-button-hover': mixHex(accent, '#ffffff', 0.12),
    '--intake-select-hover-bg': mixHex('#ffffff', accent, 0.12),
    '--intake-select-hover-text': primary,
    '--intake-label-active': primary,
  } as CSSProperties;
}
