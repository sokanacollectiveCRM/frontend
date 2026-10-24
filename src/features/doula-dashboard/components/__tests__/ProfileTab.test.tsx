import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
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
  it('starts collapsed, opens only one blank entry and can cancel it', async () => {
    await open();
    expect(
      screen.queryByLabelText('Certification name')
    ).not.toBeInTheDocument();
    const add = screen.getByRole('button', { name: 'Add certification' });
    fireEvent.click(add);
    expect(screen.getByLabelText('Certification name')).toHaveFocus();
    expect(add).toBeDisabled();
    fireEvent.click(add);
    expect(screen.getAllByLabelText('Certification name')).toHaveLength(1);
    fireEvent.click(
      screen.getByRole('button', { name: 'Cancel certification 1' })
    );
    expect(
      screen.queryByLabelText('Certification name')
    ).not.toBeInTheDocument();
    expect(add).toBeEnabled();
  });
  it('saves a completed certification even after opening another blank entry', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: '  Birth doula  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    expect(
      screen.getAllByLabelText('Certification name')[1]
    ).not.toBeRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          certifications: [
            { name: 'Birth doula', issuingOrganization: '', year: '' },
          ],
        })
      )
    );
  });
  it('saves with an untouched entry and rejects partially entered nameless entries', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Issuing organization'), {
      target: { value: 'Training organization' },
    });
    expect(screen.getByLabelText('Certification name')).toBeRequired();
    fireEvent.submit(document.querySelector('form')!);
    expect(api.updateDoulaProfile).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Issuing organization'), {
      target: { value: '   ' },
    });
    expect(screen.getByLabelText('Certification name')).not.toBeRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({ certifications: [] })
      )
    );
  });
  it('shows saved certifications after saving and reopening the profile', async () => {
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
    const saved = () =>
      within(screen.getByRole('region', { name: 'Saved certifications' }));
    expect(saved().queryByText('Birth doula')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(saved().getByText('Birth doula')).toBeInTheDocument()
    );
    expect(saved().getByText('Example Training · 2026')).toBeInTheDocument();
    cleanup();
    await open();
    expect(saved().getByText('Birth doula')).toBeInTheDocument();
    expect(saved().getByText('Example Training · 2026')).toBeInTheDocument();
  });
  it('shows a saved entry once and opens its fields only when editing', async () => {
    profile = {
      ...initial,
      certifications: [
        {
          name: 'Birth doula',
          issuingOrganization: 'Example Training',
          year: '2026',
        },
      ],
    };
    await open();
    expect(screen.getAllByText('Birth doula')).toHaveLength(1);
    expect(
      screen.queryByLabelText('Certification name')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    expect(screen.getByLabelText('Certification name')).toHaveValue('');
    expect(screen.getAllByText('Birth doula')).toHaveLength(1);
    fireEvent.click(
      screen.getByRole('button', { name: 'Cancel certification 2' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit certification 1' })
    );
    expect(screen.getByLabelText('Certification name')).toHaveValue(
      'Birth doula'
    );
    expect(screen.queryByText('Birth doula')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Postpartum doula' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(screen.getByText('Postpartum doula')).toBeInTheDocument()
    );
    expect(
      screen.queryByLabelText('Certification name')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Birth doula')).not.toBeInTheDocument();
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

it('refreshes document readiness without navigating away or losing edits', async () => {
  vi.mocked(api.getDoulaDocuments).mockResolvedValueOnce({ documents: [] });
  await open();
  const complete = await screen.findByRole('button', {
    name: 'Mark profile complete',
  });
  expect(complete).toBeDisabled();
  fireEvent.change(screen.getByLabelText('About me (bio)'), {
    target: { value: 'Unsaved updated bio' },
  });
  fireEvent(window, new Event('doula-documents-changed'));
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Mark profile complete' })
    ).toBeEnabled()
  );
  expect(screen.getByLabelText('About me (bio)')).toHaveValue(
    'Unsaved updated bio'
  );
  vi.mocked(api.getDoulaDocuments).mockResolvedValue({ documents: [] });
  fireEvent(window, new Event('doula-documents-changed'));
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Mark profile complete' })
    ).toBeDisabled()
  );
});

it('shows submission progress and ignores duplicate form submissions', async () => {
  let finish!: (value: any) => void;
  vi.mocked(api.updateDoulaProfile).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  await open();
  const complete = await screen.findByRole('button', {
    name: 'Mark profile complete',
  });
  await waitFor(() => expect(complete).toBeEnabled());
  fireEvent.click(complete);
  expect(
    screen.getByRole('button', { name: 'Submitting for review...' })
  ).toBeDisabled();
  expect(complete).toHaveAttribute('aria-busy', 'true');
  fireEvent.submit(document.querySelector('form')!);
  expect(api.updateDoulaProfile).toHaveBeenCalledTimes(1);
  finish(profile);
  await waitFor(() => expect(api.submitDoulaProfile).toHaveBeenCalledTimes(1));
  await screen.findByText('Submitted — waiting for admin review');
});
