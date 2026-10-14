import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import ProfileTab from '@/features/doula-dashboard/components/ProfileTab';
import * as api from '@/api/doulas/doulaService';
vi.mock('@/api/doulas/doulaService', () => ({
  getDoulaProfile: vi.fn(),
  getDoulaDocuments: vi.fn(),
  updateDoulaProfile: vi.fn(),
  submitDoulaProfile: vi.fn(),
  getDoulaAvailability: vi.fn(),
  createDoulaAvailability: vi.fn(),
  deleteDoulaAvailability: vi.fn(),
  updateDoulaAvailability: vi.fn(),
  uploadDoulaProfilePicture: vi.fn(),
}));
vi.mock('@/common/components/form/ProfileImageInput', () => ({
  ProfileImageInput: () => <div>Profile photo</div>,
}));
const initial = {
  id: 'fictional',
  firstname: 'Maya',
  lastname: 'Rivers',
  email: 'maya@example.com',
  address: '1 Fictional Way',
  city: 'Chicago',
  state: 'IL',
  country: 'US',
  zip_code: '60601',
  bio: 'I am a birth doula.',
  pronouns: '',
  race_ethnicity: [],
  languages_other_than_english: [],
  certifications: [],
  account_status: 'approved',
  availability_status: 'available',
};
let profile: any;
beforeEach(() => {
  vi.clearAllMocks();
  profile = { ...initial };
  vi.mocked(api.getDoulaProfile).mockImplementation(async () => profile);
  vi.mocked(api.getDoulaDocuments).mockResolvedValue({
    documents: [
      {
        id: 'training',
        documentType: 'training_certificate',
        status: 'uploaded',
      } as any,
    ],
  });
  vi.mocked(api.getDoulaAvailability).mockResolvedValue({
    records: [],
    availabilityStatus: {
      status: 'available',
      reason: null,
      startAt: null,
      endAt: null,
    },
  });
  vi.mocked(api.updateDoulaProfile).mockImplementation(async (data) => {
    profile = { ...profile, ...data };
    return profile;
  });
  vi.mocked(api.submitDoulaProfile).mockImplementation(async () => {
    profile = { ...profile, profile_submitted_at: '2026-10-13T12:00:00Z' };
    return { profile_submitted_at: profile.profile_submitted_at };
  });
});
afterEach(cleanup);
async function open() {
  render(<ProfileTab />);
  await waitFor(() =>
    expect(screen.getByLabelText('About me (bio)')).toHaveValue(profile.bio)
  );
}
describe('doula profile layout', () => {
  it('saves with empty optional demographics and places bio before scheduling', async () => {
    await open();
    const bio = screen.getByLabelText('About me (bio)'),
      scheduling = screen.getByLabelText('Scheduling Link');
    expect(
      bio.compareDocumentPosition(scheduling) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByLabelText('Pronouns')).not.toBeRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          pronouns: '',
          race_ethnicity: [],
          languages_other_than_english: [],
        })
      )
    );
  });
  it('blocks saving an empty bio', async () => {
    await open();
    fireEvent.change(screen.getByLabelText('About me (bio)'), {
      target: { value: '' },
    });
    fireEvent.submit(document.querySelector('form')!);
    expect(api.updateDoulaProfile).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Mark profile complete' })
    ).toBeDisabled();
  });
  it('adds, removes and persists structured certifications in the header area', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Birth doula' },
    });
    fireEvent.change(screen.getByLabelText('Issuing organization'), {
      target: { value: 'Example Training' },
    });
    fireEvent.change(screen.getByLabelText('Year'), {
      target: { value: '2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          certifications: [
            {
              name: 'Birth doula',
              issuingOrganization: 'Example Training',
              year: '2026',
            },
          ],
        })
      )
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).not.toBeDisabled()
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove certification 1' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenLastCalledWith(
        expect.objectContaining({ certifications: [] })
      )
    );
  });
  it('submits only with a certificate and shows the persistent review badge', async () => {
    await open();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Mark profile complete' })
      ).not.toBeDisabled()
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Mark profile complete' })
    );
    await waitFor(() =>
      expect(api.submitDoulaProfile).toHaveBeenCalledTimes(1)
    );
    expect(await screen.findByText('Submitted for review')).toBeVisible();
  });
  it('disables submission without the training certificate', async () => {
    vi.mocked(api.getDoulaDocuments).mockResolvedValue({ documents: [] });
    await open();
    expect(
      screen.getByRole('button', { name: 'Mark profile complete' })
    ).toBeDisabled();
  });
});
