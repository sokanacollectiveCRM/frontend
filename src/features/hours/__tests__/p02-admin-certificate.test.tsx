import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { EditDoulaDialog } from '@/features/hours/components/EditDoulaDialog';
import { fetchWithAuth } from '@/api/http';
import { fictionalFile, formats } from '@/test/fixtures/makeDocumentFile';
import { DOCUMENT_TYPE_ERROR } from '@/common/utils/documentUpload';
vi.mock('@/api/http', () => ({
  buildUrl: (path: string) => path,
  fetchWithAuth: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchWithAuth).mockResolvedValue({
    ok: true,
    json: async () => ({}),
  } as Response);
});
function show() {
  render(
    <EditDoulaDialog
      open
      onOpenChange={() => {}}
      onUpdateSuccess={() => {}}
      doula={
        {
          id: 'fictional-doula',
          first_name: 'Example',
          last_name: 'Doula',
          email: 'doula@example.test',
          unit_number: 'Fictional Unit 2',
          certifications: [],
        } as never
      }
    />
  );
  return document.getElementById('certification-upload')!;
}
it.each(Object.keys(formats) as (keyof typeof formats)[])(
  'uploads a %s certificate, including uppercase extensions',
  async (extension) => {
    const input = show();
    const file = fictionalFile(extension, true);
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByText(file.name);
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(fetchWithAuth).toHaveBeenCalledTimes(2));
    expect(
      JSON.parse(vi.mocked(fetchWithAuth).mock.calls[0][1]?.body as string)
    ).toMatchObject({ unit_number: 'Fictional Unit 2' });
    const upload = vi.mocked(fetchWithAuth).mock.calls[1][1]?.body as FormData;
    expect((upload.get('certification_files') as File).name).toBe(file.name);
  }
);
it.each(['exe', 'docx', 'gif', 'pdf'])(
  'shows unsupported/disguised %s inline',
  async (extension) => {
    const input = show();
    fireEvent.change(input, {
      target: {
        files: [
          new File(['fictional text'], `fictional.${extension}`, {
            type: 'application/pdf',
          }),
        ],
      },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      DOCUMENT_TYPE_ERROR
    );
    expect(fetchWithAuth).not.toHaveBeenCalled();
  }
);
it('shows a server rejection beside the certificate picker', async () => {
  vi.mocked(fetchWithAuth)
    .mockResolvedValueOnce({ ok: true } as Response)
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: DOCUMENT_TYPE_ERROR }),
    } as Response);
  const input = show();
  const file = fictionalFile('pdf');
  fireEvent.change(input, { target: { files: [file] } });
  await screen.findByText(file.name);
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    DOCUMENT_TYPE_ERROR
  );
});
