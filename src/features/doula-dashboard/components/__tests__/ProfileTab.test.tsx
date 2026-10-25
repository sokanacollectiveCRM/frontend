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
const { setUser, preloadImage } = vi.hoisted(() => ({
  setUser: vi.fn(),
  preloadImage: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/common/hooks/user/useUser', () => ({
  useUser: () => ({ setUser }),
}));
vi.mock('@/common/components/user/UserAvatar', () => ({
  default: () => <div>Avatar</div>,
  preloadProfileImage: preloadImage,
}));
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
vi.mock('@/features/doula-dashboard/components/DocumentsTab', () => ({
  default: () => <div>Profile document grid</div>,
}));
vi.mock('@/common/components/form/ProfileImageInput', () => ({
  ProfileImageInput: ({
    onFileChange,
  }: {
    onFileChange: (file: File) => void;
  }) => (
    <input
      aria-label='Profile photo'
      type='file'
      onChange={(e) => onFileChange(e.target.files![0])}
    />
  ),
}));
const initial = {
  id: 'fictional',
  firstname: 'Maya',
  lastname: 'Rivers',
  email: 'maya@example.com',
  phone_number: '5555550100',
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
async function open(step = 'About you') {
  render(<ProfileTab />);
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Edit profile' }) ||
        screen.queryByLabelText('About me (bio)')
    ).not.toBeNull()
  );
  const edit = screen.queryByRole('button', { name: 'Edit profile' });
  if (edit) fireEvent.click(edit);
  await waitFor(() =>
    expect(screen.getByLabelText('About me (bio)')).toHaveValue(profile.bio)
  );
  fireEvent.click(
    screen.getByRole('button', { name: `${step} step`, exact: true })
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
      screen.getByRole('button', {
        name: 'Mark profile complete',
        hidden: true,
      })
    ).toBeDisabled();
  });
  it('starts collapsed, opens only one blank entry and can cancel it', async () => {
    await open('Certifications');
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
    await open('Certifications');
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
            {
              name: 'Birth doula',
              issuingOrganization: '',
              expiration_date: null,
              no_expiration: false,
            },
          ],
        })
      )
    );
  });
  it('saves with an untouched entry and rejects partially entered nameless entries', async () => {
    await open('Certifications');
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
    await open('Certifications');
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Birth doula' },
    });
    fireEvent.change(screen.getByLabelText('Issuing organization'), {
      target: { value: 'Example Training' },
    });
    fireEvent.change(screen.getByLabelText('Expiration date'), {
      target: { value: '2028-03-31' },
    });
    const saved = () =>
      within(screen.getByRole('region', { name: 'Saved certifications' }));
    expect(saved().queryByText('Birth doula')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(saved().getByText('Birth doula')).toBeInTheDocument()
    );
    expect(
      saved().getByText('Example Training · Expires Mar 31, 2028')
    ).toBeInTheDocument();
    cleanup();
    await open('Certifications');
    expect(saved().getByText('Birth doula')).toBeInTheDocument();
    expect(
      saved().getByText('Example Training · Expires Mar 31, 2028')
    ).toBeInTheDocument();
  });
  it('shows a saved entry once and opens its fields only when editing', async () => {
    profile = {
      ...initial,
      certifications: [
        {
          name: 'Birth doula',
          issuingOrganization: 'Example Training',
          expiration_date: '2028-03-31',
          no_expiration: false,
        },
      ],
    };
    await open('Certifications');
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
  it('saves No expiration explicitly and disables its date field', async () => {
    await open('Certifications');
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Fictional lifetime training' },
    });
    fireEvent.change(screen.getByLabelText('Expiration date'), {
      target: { value: '2028-03-31' },
    });
    fireEvent.click(screen.getByLabelText('No expiration'));
    expect(screen.getByLabelText('Expiration date')).toBeDisabled();
    expect(screen.getByLabelText('Expiration date')).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          certifications: [
            {
              name: 'Fictional lifetime training',
              issuingOrganization: '',
              expiration_date: null,
              no_expiration: true,
            },
          ],
        })
      )
    );
    await screen.findByText('No expiration', { selector: 'p' });
    expect(screen.queryByLabelText('Year')).not.toBeInTheDocument();
  });
  it('preserves historical year data without showing an issue year field or value', async () => {
    profile = {
      ...initial,
      certifications: [
        {
          name: 'Fictional legacy training',
          issuingOrganization: 'Example',
          year: '1997',
          expiration_date: null,
          no_expiration: false,
        },
      ],
    };
    await open('Certifications');
    expect(
      screen.getByText('Example · Expiration not provided')
    ).toBeInTheDocument();
    expect(screen.queryByText(/1997/)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit certification 1' })
    );
    expect(screen.queryByLabelText('Year')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Expiration date'), {
      target: { value: '2028-03-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          certifications: [
            expect.objectContaining({
              year: '1997',
              expiration_date: '2028-03-31',
            }),
          ],
        })
      )
    );
  });
  it('rejects invalid date values even when native form validation is bypassed', async () => {
    profile = {
      ...initial,
      certifications: [
        {
          name: 'Fictional training',
          issuingOrganization: 'Example',
          expiration_date: '2028-02-30',
          no_expiration: false,
        },
      ],
    };
    await open('Certifications');
    fireEvent.submit(document.querySelector('form')!);
    expect(api.updateDoulaProfile).not.toHaveBeenCalled();
  });
  it('Cancel restores a saved entry and discards a new filled entry', async () => {
    profile = {
      ...initial,
      certifications: [
        {
          name: 'Fictional saved training',
          issuingOrganization: 'Example Academy',
          expiration_date: '2028-03-31',
          no_expiration: false,
        },
      ],
    };
    await open('Certifications');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit certification 1' })
    );
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Unsaved change' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Cancel certification 1' })
    );
    expect(screen.getByText('Fictional saved training')).toBeVisible();
    expect(
      screen.queryByLabelText('Certification name')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Unsaved new training' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Cancel certification 2' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          certifications: [
            expect.objectContaining({
              name: 'Fictional saved training',
              expiration_date: '2028-03-31',
            }),
          ],
        })
      )
    );
  });
  it('adds, removes and persists structured certifications in the header area', async () => {
    await open('Certifications');
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Birth doula' },
    });
    fireEvent.change(screen.getByLabelText('Issuing organization'), {
      target: { value: 'Example Training' },
    });
    fireEvent.change(screen.getByLabelText('Expiration date'), {
      target: { value: '2028-03-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          certifications: [
            {
              name: 'Birth doula',
              issuingOrganization: 'Example Training',
              expiration_date: '2028-03-31',
              no_expiration: false,
            },
          ],
        })
      )
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Edit profile' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Certifications step', exact: true })
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
    await open('Review');
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'Mark profile complete',
          hidden: true,
        })
      ).not.toBeDisabled()
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mark profile complete',
        hidden: true,
      })
    );
    await waitFor(() =>
      expect(api.submitDoulaProfile).toHaveBeenCalledTimes(1)
    );
    expect(await screen.findByText('Submitted for review')).toBeVisible();
  });
  it('disables submission without the training certificate', async () => {
    vi.mocked(api.getDoulaDocuments).mockResolvedValue({ documents: [] });
    await open('Review');
    expect(
      screen.getByRole('button', {
        name: 'Mark profile complete',
        hidden: true,
      })
    ).toBeDisabled();
  });
});

it('refreshes document readiness without navigating away or losing edits', async () => {
  vi.mocked(api.getDoulaDocuments).mockResolvedValueOnce({ documents: [] });
  await open('Review');
  expect(
    screen.getByRole('button', { name: 'Documents step' })
  ).toHaveAttribute('aria-current', 'step');
  const complete = screen.getByRole('button', {
    name: 'Mark profile complete',
    hidden: true,
  });
  expect(complete).toBeDisabled();
  fireEvent.change(screen.getByLabelText('About me (bio)'), {
    target: { value: 'Unsaved updated bio' },
  });
  fireEvent(window, new Event('doula-documents-changed'));
  await waitFor(() =>
    expect(
      screen.getByRole('button', {
        name: 'Mark profile complete',
        hidden: true,
      })
    ).toBeEnabled()
  );
  expect(screen.getByLabelText('About me (bio)')).toHaveValue(
    'Unsaved updated bio'
  );
  vi.mocked(api.getDoulaDocuments).mockResolvedValue({ documents: [] });
  fireEvent(window, new Event('doula-documents-changed'));
  await waitFor(() =>
    expect(
      screen.getByRole('button', {
        name: 'Mark profile complete',
        hidden: true,
      })
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
  await open('Review');
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

describe('P-15 required private phone', () => {
  it('formats digits as the doula types, saves digits, and reloads dashed', async () => {
    await open();
    const phone = screen.getByLabelText('Phone number');
    for (const [value, expected] of [
      ['5', '5'],
      ['5555', '555-5'],
      ['5555550', '555-555-0'],
      ['5555550100', '555-555-0100'],
    ]) {
      fireEvent.change(phone, { target: { value } });
      expect(phone).toHaveValue(expected);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({ phone_number: '5555550100' })
      )
    );
    expect(phone).toHaveValue('555-555-0100');
    cleanup();
    await open();
    expect(screen.getByLabelText('Phone number')).toHaveValue('555-555-0100');
  });
  it.each(['', '555555010', '55555501000', '555555010a', '5555550100abc'])(
    'blocks saving invalid phone %s with a clear message',
    async (value) => {
      profile = { ...initial, phone_number: null };
      await open();
      fireEvent.change(screen.getByLabelText('Phone number'), {
        target: { value },
      });
      fireEvent.submit(document.querySelector('form')!);
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Enter a 10-digit phone number'
      );
      expect(api.updateDoulaProfile).not.toHaveBeenCalled();
      expect(api.submitDoulaProfile).not.toHaveBeenCalled();
    }
  );
  it('keeps a legacy profile accessible but incomplete without a phone', async () => {
    profile = { ...initial, phone_number: null };
    const onProfileStatusChange = vi.fn();
    render(<ProfileTab onProfileStatusChange={onProfileStatusChange} />);
    await screen.findByLabelText('Phone number');
    await waitFor(() =>
      expect(onProfileStatusChange).toHaveBeenCalledWith({
        isComplete: false,
        missingFields: ['Phone number'],
      })
    );
    expect(
      screen.getByRole('button', {
        name: 'Mark profile complete',
        hidden: true,
      })
    ).toBeDisabled();
  });
});

describe('profile slider steps', () => {
  it('shows one step at a time and keeps edits when moving back and forward', async () => {
    await open();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1'
    );
    expect(screen.getByLabelText('Phone number')).toBeVisible();
    expect(screen.getByLabelText('Address')).not.toBeVisible();
    fireEvent.change(screen.getByLabelText('About me (bio)'), {
      target: { value: 'Unsaved fictional bio' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
    expect(screen.getByLabelText('Address')).toBeVisible();
    expect(screen.getByLabelText('Phone number')).not.toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '2'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
    expect(screen.getByLabelText('About me (bio)')).toHaveValue(
      'Unsaved fictional bio'
    );
    expect(api.updateDoulaProfile).not.toHaveBeenCalled();
  });
  it('marks every missing required field red immediately and clears the error as it is filled', async () => {
    profile = {
      ...initial,
      firstname: '',
      lastname: '',
      bio: '',
      phone_number: null,
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
    };
    await open();
    for (const label of [
      'First Name',
      'Last Name',
      'Phone number',
      'About me (bio)',
      'Address',
      'City',
      'State',
      'Zip Code',
    ]) {
      expect(screen.getByLabelText(label)).toHaveAttribute(
        'aria-invalid',
        'true'
      );
      expect(screen.getByLabelText(label)).toHaveClass('border-red-600');
    }
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1'
    );
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'P15' },
    });
    expect(screen.getByLabelText('First Name')).toHaveAttribute(
      'aria-invalid',
      'false'
    );
    expect(screen.getByLabelText('First Name')).not.toHaveClass(
      'border-red-600'
    );
    expect(
      screen.queryByText('First Name is required')
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Address step', exact: true })
    );
    expect(screen.getByLabelText('Address')).not.toBeVisible();
    for (const label of ['Last Name', 'Phone number', 'About me (bio)']) {
      fireEvent.change(screen.getByLabelText(label), {
        target: {
          value: label === 'Phone number' ? '5555550100' : 'Completed',
        },
      });
    }
    fireEvent.click(
      screen.getByRole('button', { name: 'Address step', exact: true })
    );
    expect(screen.getByLabelText('Address')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '2'
    );
  });
  it('retains an unsaved certification and expiration date when switching slides', async () => {
    await open('Certifications');
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    fireEvent.change(screen.getByLabelText('Certification name'), {
      target: { value: 'Fictional training' },
    });
    fireEvent.change(screen.getByLabelText('Expiration date'), {
      target: { value: '2030-03-31' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'About you step', exact: true })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Certifications step', exact: true })
    );
    expect(screen.getByLabelText('Certification name')).toHaveValue(
      'Fictional training'
    );
    expect(screen.getByLabelText('Expiration date')).toHaveValue('2030-03-31');
  });
});

it('Cancel discards drafts and returns to the saved read-only profile; Edit reopens the slider', async () => {
  await open();
  fireEvent.change(screen.getByLabelText('About me (bio)'), {
    target: { value: 'Discard this fictional draft' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
  expect(screen.getByRole('button', { name: 'Edit profile' })).toBeVisible();
  expect(screen.queryByLabelText('About me (bio)')).not.toBeInTheDocument();
  expect(
    within(document.getElementById('profile-panel-0')!).getByText(initial.bio)
  ).toBeVisible();
  expect(
    screen.queryByText('Discard this fictional draft')
  ).not.toBeInTheDocument();
  expect(api.updateDoulaProfile).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
  expect(screen.getByLabelText('About me (bio)')).toHaveValue(initial.bio);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
});
it('opens Documents inside the profile without losing an unsaved bio', async () => {
  await open();
  fireEvent.change(screen.getByLabelText('About me (bio)'), {
    target: { value: 'Keep this fictional draft' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Documents step', exact: true })
  );
  expect(screen.getByText('Profile document grid')).toBeVisible();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
  fireEvent.click(
    screen.getByRole('button', { name: 'About you step', exact: true })
  );
  expect(screen.getByLabelText('About me (bio)')).toHaveValue(
    'Keep this fictional draft'
  );
});

it('the top Save Changes uses the same validation and returns to read-only slider after saving', async () => {
  await open();
  fireEvent.change(screen.getByLabelText('Phone number'), {
    target: { value: '5555550101' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Save changes at top', exact: true })
  );
  await waitFor(() =>
    expect(api.updateDoulaProfile).toHaveBeenCalledWith(
      expect.objectContaining({ phone_number: '5555550101' })
    )
  );
  await screen.findByRole('button', { name: 'Edit profile', exact: true });
  expect(screen.getByRole('progressbar')).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Documents step', exact: true })
  ).toBeVisible();
});

describe('P-19 optional address unit', () => {
  it('has no country input, places the optional unit after street, and persists it on save and remount', async () => {
    await open('Address');
    expect(screen.queryByLabelText(/country/i)).not.toBeInTheDocument();
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
    const street = screen.getByLabelText('Address');
    const unit = screen.getByLabelText('Unit / Apt #');
    expect(unit).not.toBeRequired();
    expect(
      street.compareDocumentPosition(unit) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    fireEvent.change(unit, { target: { value: 'Apt 4B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(api.updateDoulaProfile).toHaveBeenCalled());
    const payload = vi.mocked(api.updateDoulaProfile).mock.calls[0][0];
    expect(payload.unit_number).toBe('Apt 4B');
    expect(payload).not.toHaveProperty('country');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Edit profile' })).toBeVisible()
    );
    cleanup();
    render(<ProfileTab />);
    await screen.findByRole('button', { name: 'Edit profile' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Address step', exact: true })
    );
    expect(
      screen
        .getAllByText('1 Fictional Way, Apt 4B, Chicago, IL 60601')
        .find((el) => el.closest('[hidden]') === null)!
    ).toBeVisible();
  });
  it('allows an empty unit and displays an older address without an empty segment', async () => {
    await open('Address');
    expect(screen.getByLabelText('Unit / Apt #')).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(api.updateDoulaProfile).toHaveBeenCalledWith(
        expect.objectContaining({ unit_number: '' })
      )
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Edit profile' })).toBeVisible()
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Address step', exact: true })
    );
    expect(
      screen
        .getAllByText('1 Fictional Way, Chicago, IL 60601')
        .find((el) => el.closest('[hidden]') === null)!
    ).toBeVisible();
    expect(screen.queryByText('Country')).not.toBeInTheDocument();
  });
});

it('synchronizes the saved doula photo with Account and header user state', async () => {
  await open('About you');
  const url = 'https://images.example.com/fictional-photo.png';
  vi.mocked(api.uploadDoulaProfilePicture).mockResolvedValue({
    ...profile,
    profile_picture: url,
  });
  fireEvent.change(screen.getByLabelText('Profile photo'), {
    target: {
      files: [new File(['fictional'], 'fictional.png', { type: 'image/png' })],
    },
  });
  await waitFor(() => expect(setUser).toHaveBeenCalled());
  expect(preloadImage).toHaveBeenCalledWith(url);
  const current = { id: 'fictional', firstname: 'Maya', profile_picture: null };
  expect(setUser.mock.calls[0][0](current)).toEqual({
    ...current,
    profile_picture: url,
  });
  expect(setUser.mock.calls[0][0](null)).toBeNull();
});

describe('P-13 required step guards', () => {
  it.each(['Next', 'Review step', 'Documents step'])(
    'blocks %s when About you is incomplete',
    async (name) => {
      await open();
      fireEvent.change(screen.getByLabelText('About me (bio)'), {
        target: { value: ' ' },
      });
      fireEvent.click(screen.getByRole('button', { name, exact: true }));
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '1'
      );
      expect(api.updateDoulaProfile).not.toHaveBeenCalled();
    }
  );
  it.each(['Address', 'City', 'State', 'Zip Code'])(
    'cannot jump over blank %s from an earlier step',
    async (label) => {
      await open('Address');
      fireEvent.change(screen.getByLabelText(label), {
        target: { value: ' ' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'About you step' }));
      fireEvent.click(screen.getByRole('button', { name: 'Review step' }));
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '2'
      );
      expect(screen.getByLabelText(label)).toBeVisible();
      fireEvent.click(
        screen.getByRole('button', { name: 'Next', exact: true })
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '2'
      );
      fireEvent.submit(document.querySelector('form')!);
      expect(api.updateDoulaProfile).not.toHaveBeenCalled();
    }
  );
  it('marks a partially entered certification name red and blocks forward navigation until named', async () => {
    await open('Certifications');
    fireEvent.click(screen.getByRole('button', { name: 'Add certification' }));
    const name = screen.getByLabelText('Certification name');
    expect(name).not.toBeRequired();
    expect(name).not.toHaveClass('border-red-600');
    fireEvent.change(screen.getByLabelText('Issuing organization'), {
      target: { value: 'Fictional organization' },
    });
    expect(name).toBeRequired();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveClass('border-red-600');
    expect(screen.getByText('Certification name is required')).toBeVisible();
    for (const button of ['Next', 'Review step']) {
      fireEvent.click(
        screen.getByRole('button', { name: button, exact: true })
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '3'
      );
    }
    fireEvent.change(name, { target: { value: 'Fictional certification' } });
    expect(name).not.toHaveClass('border-red-600');
    fireEvent.click(screen.getByRole('button', { name: 'Review step' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '7'
    );
  });
  it('blocks skipping a missing required document while allowing backward navigation', async () => {
    vi.mocked(api.getDoulaDocuments).mockResolvedValue({ documents: [] });
    await open('Documents');
    for (const name of ['Next', 'Scheduling step', 'Review step']) {
      fireEvent.click(screen.getByRole('button', { name, exact: true }));
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '4'
      );
    }
    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '3'
    );
  });
  it('marks unavailable dates red, blocks navigation and saves, and clears errors when completed', async () => {
    await open('Scheduling');
    fireEvent.change(screen.getByLabelText('Availability Status'), {
      target: { value: 'unavailable' },
    });
    for (const label of ['Unavailable From', 'Unavailable Until']) {
      expect(screen.getByLabelText(label)).toBeRequired();
      expect(screen.getByLabelText(label)).toHaveAttribute(
        'aria-invalid',
        'true'
      );
      expect(screen.getByLabelText(label)).toHaveClass('border-red-600');
    }
    fireEvent.click(screen.getByRole('button', { name: 'Review step' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '5'
    );
    fireEvent.submit(document.querySelector('form')!);
    expect(api.updateDoulaProfile).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Unavailable From'), {
      target: { value: '2026-11-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '5'
    );
    fireEvent.change(screen.getByLabelText('Unavailable Until'), {
      target: { value: '2026-11-02' },
    });
    for (const label of ['Unavailable From', 'Unavailable Until']) {
      expect(screen.getByLabelText(label)).not.toHaveClass('border-red-600');
      expect(screen.getByLabelText(label)).toHaveAttribute(
        'aria-invalid',
        'false'
      );
    }
    fireEvent.click(screen.getByRole('button', { name: 'Review step' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '7'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Scheduling step' }));
    fireEvent.change(screen.getByLabelText('Availability Status'), {
      target: { value: 'available' },
    });
    expect(screen.queryByLabelText('Unavailable From')).not.toBeInTheDocument();
  });
});
