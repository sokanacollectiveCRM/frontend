export interface ClientNote {
  id: string;
  clientId: string;
  type: string;
  description: string;
  metadata?: {
    category?: string;
    priority?: string;
    [key: string]: any;
  };
  timestamp: string;
  createdBy?: string;
}

export interface CreateNoteRequest {
  type: string;
  description: string;
  metadata?: {
    category?: string;
    priority?: string;
    [key: string]: any;
  };
}

type NotesViewerRole = 'admin' | 'doula' | 'client' | string | null | undefined;

const asCleanString = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  const str = String(value).trim();
  return str ? str : undefined;
};

const normalizeNoteRow = (row: any, clientId: string): ClientNote => {
  const metadata =
    row.metadata && typeof row.metadata === 'object' ? row.metadata : undefined;

  const createdBy =
    asCleanString(row.display_name) ??
    asCleanString(row.created_by_display_name) ??
    asCleanString(row.createdByDisplayName) ??
    asCleanString(row.created_by_name) ??
    asCleanString(row.createdByName) ??
    asCleanString(row.created_by_email) ??
    asCleanString(row.createdByEmail) ??
    asCleanString(row.author_name) ??
    asCleanString(row.authorName) ??
    asCleanString(metadata?.created_by_display_name) ??
    asCleanString(metadata?.createdByDisplayName) ??
    asCleanString(metadata?.created_by_name) ??
    asCleanString(metadata?.createdByName) ??
    asCleanString(metadata?.created_by_email) ??
    asCleanString(metadata?.createdByEmail) ??
    asCleanString(metadata?.author_name) ??
    asCleanString(metadata?.authorName) ??
    asCleanString(row.created_by) ??
    asCleanString(row.createdBy);

  return {
    id: String(row.id),
    clientId: String(row.client_id ?? clientId),
    type: String(row.activity_type ?? row.type ?? 'note'),
    description: String(row.content ?? row.description ?? ''),
    metadata,
    timestamp: String(row.created_at ?? row.timestamp ?? row.createdAt ?? ''),
    ...(createdBy ? { createdBy } : {}),
  };
};

const normalizeNotes = (raw: any, clientId: string): ClientNote[] => {
  const rawList = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.activities)
      ? raw.activities
      : Array.isArray(raw)
        ? raw
        : [];

  return rawList.map((row: any) => normalizeNoteRow(row, clientId));
};

const getNotesUrl = (clientId: string, role?: NotesViewerRole): string[] => {
  const base = (import.meta.env.VITE_APP_BACKEND_URL || '').replace(/\/+$/, '');
  const clientIdSafe = encodeURIComponent(clientId);

  // Doulas must use doula-scoped activities endpoint to reliably fetch
  // staff notes on assigned clients (admin + co-doula entries).
  if (role === 'doula') {
    return [
      `${base}/api/doulas/clients/${clientIdSafe}/activities`,
      `${base}/api/clients/${clientIdSafe}/activities`,
    ];
  }

  return [`${base}/api/clients/${clientIdSafe}/activities`];
};

export const getClientNotes = async (
  clientId: string,
  role?: NotesViewerRole
): Promise<ClientNote[]> => {
  try {
    const urls = getNotesUrl(clientId, role);
    const settled = await Promise.allSettled(
      urls.map(async (url) => {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch notes: ${response.status}`);
        }

        return normalizeNotes(await response.json(), clientId);
      })
    );

    const successful = settled
      .filter(
        (result): result is PromiseFulfilledResult<ClientNote[]> =>
          result.status === 'fulfilled'
      )
      .flatMap((result) => result.value);

    if (successful.length === 0) {
      throw new Error('Failed to fetch notes: all note endpoints failed');
    }

    const deduped = new Map<string, ClientNote>();
    successful.forEach((note) => {
      const key =
        note.id && note.id !== 'undefined'
          ? note.id
          : `${note.timestamp}|${note.description}`;
      if (!deduped.has(key)) {
        deduped.set(key, note);
      }
    });

    return Array.from(deduped.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (err) {
    console.error('Error fetching client notes:', err);
    throw err;
  }
};

export const createClientNote = async (
  clientId: string,
  noteData: CreateNoteRequest
): Promise<ClientNote> => {
  try {
    const payload = {
      activity_type: noteData.type,
      content: noteData.description,
      ...(noteData.metadata ? { metadata: noteData.metadata } : {}),
    };

    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/api/clients/${clientId}/activity`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create note: ${response.status}`);
    }

    const result = await response.json();
    const raw =
      result?.activity ?? result?.data?.activity ?? result?.data ?? result;

    if (!raw || typeof raw !== 'object') {
      throw new Error('Failed to create note: invalid response shape');
    }

    return normalizeNoteRow(raw, clientId);
  } catch (err) {
    console.error('Error creating client note:', err);
    throw err;
  }
};
