import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { DocumentPreview } from './DocumentPreview';
afterEach(cleanup);
it.each(['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'])(
  'shows %s images inline',
  (extension) => {
    render(
      <DocumentPreview
        source={{
          url: 'https://example.test/private-signed-file',
          fileName: `fictional.${extension}`,
        }}
        onClose={() => {}}
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.test/private-signed-file'
    );
    expect(screen.queryByTitle('PDF document preview')).not.toBeInTheDocument();
  }
);
it.each(['pdf', 'PDF'])('uses a browser viewer for %s', (extension) => {
  render(
    <DocumentPreview
      source={{
        url: 'https://example.test/private-signed-file',
        fileName: `fictional.${extension}`,
      }}
      onClose={() => {}}
    />
  );
  expect(screen.getByTitle('PDF document preview')).toHaveAttribute(
    'src',
    'https://example.test/private-signed-file'
  );
  expect(screen.getByRole('link')).toHaveAttribute(
    'rel',
    'noopener noreferrer'
  );
});
