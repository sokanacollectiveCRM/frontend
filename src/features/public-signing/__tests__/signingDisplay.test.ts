import {
  defaultTypedSignatureValue,
  TYPED_SIGNATURE_FONT,
  typedSignatureStyle,
} from '@/features/public-signing/signingDisplay';
import { describe, expect, it } from 'vitest';

describe('signing display', () => {
  it('uses Great Vibes for typed signatures', () => {
    expect(TYPED_SIGNATURE_FONT).toContain('Great Vibes');
    expect(defaultTypedSignatureValue('Jane Doe')).toEqual({
      type: 'typed',
      text: 'Jane Doe',
      fontFamily: TYPED_SIGNATURE_FONT,
    });
    expect(typedSignatureStyle().fontFamily).toBe(TYPED_SIGNATURE_FONT);
  });
});
