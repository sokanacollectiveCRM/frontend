import { describe, expect, it } from 'vitest';
import { formatAddress } from './formatAddress';
const address = {
  address: '100 Fictional Way',
  city: 'Chicago',
  state: 'IL',
  zip_code: '60601',
};
describe('private address display', () => {
  it('formats a unit between street and city', () =>
    expect(formatAddress({ ...address, unit_number: ' Apt 4B ' })).toBe(
      '100 Fictional Way, Apt 4B, Chicago, IL 60601'
    ));
  it.each([undefined, null, '', ' '])(
    'formats legacy and empty units %s',
    (unit_number) =>
      expect(formatAddress({ ...address, unit_number })).toBe(
        '100 Fictional Way, Chicago, IL 60601'
      )
  );
  it('omits absent address parts', () =>
    expect(formatAddress({ state: 'IL', zip_code: '60601' })).toBe('IL 60601'));
});
