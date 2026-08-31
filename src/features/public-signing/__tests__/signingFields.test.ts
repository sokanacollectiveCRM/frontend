import {
  buildFieldQueue,
  canApplyField,
  completedFieldCount,
  completedFieldIds,
  fieldTagLabel,
  missingRequiredFieldIds,
  nextIncompleteFieldId,
  floorRenderedPageSize,
  overlayStyle,
  overlayStylePx,
  requiredSigningFieldCount,
} from '@/features/public-signing/signingFields';
import type { SigningManifestField } from '@/features/public-signing/types';
import { describe, expect, it } from 'vitest';

const manifest: SigningManifestField[] = [
  {
    id: 'initials-2',
    kind: 'initials',
    page: 2,
    coordinates: { x: 0.5, y: 0.5, width: 0.1, height: 0.05 },
    required: true,
  },
  {
    id: 'signature-1',
    kind: 'signature',
    page: 1,
    coordinates: { x: 0.1, y: 0.2, width: 0.3, height: 0.1 },
    required: true,
  },
  {
    id: 'initials-1',
    kind: 'initials',
    page: 1,
    coordinates: { x: 0.5, y: 0.5, width: 0.1, height: 0.05 },
    required: true,
  },
  {
    id: 'date-1',
    kind: 'signing_date',
    page: 2,
    coordinates: { x: 0.2, y: 0.8, width: 0.2, height: 0.05 },
    required: true,
  },
  {
    id: 'ack-1',
    kind: 'acknowledgment',
    page: 2,
    coordinates: { x: 0.1, y: 0.9, width: 0.5, height: 0.05 },
    required: true,
  },
  {
    id: 'optional-initials',
    kind: 'initials',
    page: 1,
    coordinates: { x: 0.7, y: 0.5, width: 0.1, height: 0.05 },
    required: false,
  },
];

describe('signing manifest fields', () => {
  it('positions overlays from top-left normalized coordinates', () => {
    expect(
      overlayStyle({ x: 0.125, y: 0.25, width: 0.5, height: 0.075 })
    ).toEqual({
      left: '12.5%',
      top: '25%',
      width: '50%',
      height: '7.5%',
    });
  });

  it('sorts the guided queue by page, vertical position, then horizontal position', () => {
    expect(buildFieldQueue(manifest).map((field) => field.id)).toEqual([
      'signature-1',
      'initials-1',
      'initials-2',
      'date-1',
      'ack-1',
    ]);
  });

  it('tracks completion per applied field ID instead of signer values', () => {
    const applied = new Set(['date-1']);
    expect(completedFieldIds(manifest, applied)).toEqual(['date-1']);
    expect(completedFieldCount(manifest, applied)).toBe(1);
    expect(requiredSigningFieldCount(manifest)).toBe(5);
    expect(missingRequiredFieldIds(manifest, applied)).toEqual([
      'signature-1',
      'initials-1',
      'initials-2',
      'ack-1',
    ]);
  });

  it('requires each initials field to be applied individually', () => {
    const oneInitial = new Set(['initials-1']);
    expect(missingRequiredFieldIds(manifest, oneInitial)).toContain(
      'initials-2'
    );
    expect(missingRequiredFieldIds(manifest, oneInitial)).not.toContain(
      'initials-1'
    );
  });

  it('finds the next incomplete field after the current index', () => {
    const applied = new Set(['signature-1', 'initials-1']);
    expect(nextIncompleteFieldId(buildFieldQueue(manifest), applied, 2)).toBe(
      'initials-2'
    );
  });

  it('gates field application on adopted signature and initials values', () => {
    const initialsField = manifest.find((field) => field.id === 'initials-1')!;
    const signatureField = manifest.find(
      (field) => field.id === 'signature-1'
    )!;
    const dateField = manifest.find((field) => field.id === 'date-1')!;

    expect(canApplyField(initialsField, new Set(), '', false)).toBe(false);
    expect(canApplyField(initialsField, new Set(), 'JD', false)).toBe(true);
    expect(canApplyField(signatureField, new Set(), 'JD', false)).toBe(false);
    expect(canApplyField(signatureField, new Set(), 'JD', true)).toBe(true);
    expect(canApplyField(dateField, new Set(), '', false)).toBe(true);
  });

  it('uses short tag labels for visible field markers', () => {
    expect(fieldTagLabel('signature')).toBe('Sign');
    expect(fieldTagLabel('initials')).toBe('Initial');
    expect(fieldTagLabel('signing_date')).toBe('Date');
  });

  it('includes every required ID once all fields are individually applied', () => {
    const applied = new Set([
      'signature-1',
      'initials-1',
      'initials-2',
      'date-1',
      'ack-1',
    ]);
    expect(missingRequiredFieldIds(manifest, applied)).toEqual([]);
  });
});

describe('overlay geometry', () => {
  it('uses percentage positioning without transforms or viewport units', () => {
    const style = overlayStyle({
      x: 0.449,
      y: 0.801,
      width: 0.09,
      height: 0.025,
    });
    expect(style).toEqual({
      left: '44.9%',
      top: '80.1%',
      width: '9%',
      height: '2.5%',
    });
    expect(JSON.stringify(style)).not.toMatch(/vw|vh|transform|calc/i);
  });

  it('maps normalized coordinates to rendered page pixels', () => {
    expect(
      overlayStylePx({ x: 0.5, y: 0.25, width: 0.1, height: 0.05 }, 600, 800)
    ).toEqual({
      left: '300px',
      top: '200px',
      width: '60px',
      height: '40px',
    });
  });

  it('floors rendered page size to match react-pdf canvas CSS pixels', () => {
    expect(floorRenderedPageSize(803.9, 1041.2)).toEqual({
      width: 803,
      height: 1041,
    });
    expect(floorRenderedPageSize(0, 100)).toBeNull();
    expect(floorRenderedPageSize(100, -1)).toBeNull();
  });
});
