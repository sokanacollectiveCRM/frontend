import { DOCUMENT_FIXTURES } from './documentFiles';
export const formats = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
};
export function fictionalFile(
  extension: keyof typeof formats,
  uppercase = false
) {
  const bytes = Uint8Array.from(
    atob(DOCUMENT_FIXTURES[extension === 'jpeg' ? 'jpg' : extension]),
    (c) => c.charCodeAt(0)
  );
  return new File(
    [bytes],
    `fictional.${uppercase ? extension.toUpperCase() : extension}`,
    { type: formats[extension] }
  );
}
