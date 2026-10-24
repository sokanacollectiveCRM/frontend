import { describe, expect, it } from 'vitest';
import { DOCUMENT_FIXTURES } from '@/test/fixtures/documentFiles';
import {
  validateDocumentFile,
  DOCUMENT_TYPE_ERROR,
  DOCUMENT_SIZE_LIMIT,
} from './documentUpload';
const types = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
};
export function fictionalFile(
  extension: keyof typeof types,
  uppercase = false
) {
  const bytes = Uint8Array.from(
    atob(DOCUMENT_FIXTURES[extension === 'jpeg' ? 'jpg' : extension]),
    (c) => c.charCodeAt(0)
  );
  return new File(
    [bytes],
    `fictional.${uppercase ? extension.toUpperCase() : extension}`,
    { type: types[extension] }
  );
}
describe('Document content validation', () => {
  it.each(['jpg', 'jpeg', 'png', 'pdf'] as const)(
    'accepts actual %s bytes with either extension case',
    async (extension) => {
      await expect(
        validateDocumentFile(fictionalFile(extension))
      ).resolves.toBeUndefined();
      await expect(
        validateDocumentFile(fictionalFile(extension, true))
      ).resolves.toBeUndefined();
    }
  );
  it.each(['exe', 'docx', 'gif', 'pdf'])(
    'rejects unsupported or disguised %s',
    async (extension) => {
      const file = new File(['fictional text'], `fictional.${extension}`, {
        type: 'application/pdf',
      });
      await expect(validateDocumentFile(file)).rejects.toThrow(
        DOCUMENT_TYPE_ERROR
      );
    }
  );
  it('rejects a MIME or extension mismatch', async () => {
    const pdf = fictionalFile('pdf');
    await expect(
      validateDocumentFile(
        new File([pdf], 'fictional.jpg', { type: 'image/jpeg' })
      )
    ).rejects.toThrow(DOCUMENT_TYPE_ERROR);
    await expect(
      validateDocumentFile(
        new File([pdf], 'fictional.pdf', { type: 'image/png' })
      )
    ).rejects.toThrow(DOCUMENT_TYPE_ERROR);
  });
  it('keeps the 10 MiB size limit', async () => {
    await expect(
      validateDocumentFile(
        new File([new Uint8Array(DOCUMENT_SIZE_LIMIT + 1)], 'large.pdf', {
          type: 'application/pdf',
        })
      )
    ).rejects.toThrow('10MB');
  });
});
