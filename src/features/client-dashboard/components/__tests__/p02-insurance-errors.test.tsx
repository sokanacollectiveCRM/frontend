import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ClientProfileTab from '@/features/client-dashboard/components/ClientProfileTab';
import { fictionalFile } from '@/test/fixtures/makeDocumentFile';
import { DOCUMENT_TYPE_ERROR } from '@/common/utils/documentUpload';
import { fetchWithAuth } from '@/api/http';
vi.mock('@/common/hooks/auth/useClientAuth', () => ({
  useClientAuth: () => ({
    client: {
      id: 'fictional-client',
      first_name: 'Example',
      last_name: 'Client',
    },
  }),
}));
vi.mock('@/common/hooks/user/useUser', () => ({
  useUser: () => ({ user: null }),
}));
vi.mock('@/api/http', () => ({
  buildUrl: (path: string) => path,
  fetchWithAuth: vi.fn(),
}));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => {
  vi.mocked(fetchWithAuth).mockImplementation(
    async () =>
      ({
        ok: true,
        json: async () => ({
          payment_method: 'private/commercial insurance',
          firstname: 'Example',
          lastname: 'Client',
        }),
        text: async () => '[]',
      }) as Response
  );
});
describe.each(['front', 'back'])(
  'P-02 insurance %s inline validation',
  (side) => {
    it.each(['exe', 'docx', 'gif', 'pdf'])(
      'shows unsupported/disguised %s beside the field',
      async (extension) => {
        render(<ClientProfileTab view='billing' />);
        fireEvent.click(
          await screen.findByRole('button', { name: 'Edit Billing' })
        );
        await waitFor(() =>
          expect(
            document.getElementById(`insurance-card-${side}-upload`)
          ).toBeInTheDocument()
        );
        const input = document.getElementById(`insurance-card-${side}-upload`)!;
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
        expect(input).toHaveAttribute('aria-invalid', 'true');
      }
    );
    it('shows a backend rejection inline', async () => {
      const normal = vi.mocked(fetchWithAuth).getMockImplementation()!;
      vi.mocked(fetchWithAuth).mockImplementation(async (url, options) => {
        if (options?.method === 'POST') {
          return {
            ok: false,
            status: 400,
            text: async () => JSON.stringify({ error: DOCUMENT_TYPE_ERROR }),
          } as Response;
        }
        return normal(url, options);
      });
      render(<ClientProfileTab view='billing' />);
      fireEvent.click(
        await screen.findByRole('button', { name: 'Edit Billing' })
      );
      await waitFor(() =>
        expect(
          document.getElementById(`insurance-card-${side}-upload`)
        ).toBeInTheDocument()
      );
      fireEvent.change(
        document.getElementById(`insurance-card-${side}-upload`)!,
        { target: { files: [fictionalFile('pdf')] } }
      );
      expect(await screen.findByRole('alert')).toHaveTextContent(
        DOCUMENT_TYPE_ERROR
      );
    });
  }
);
