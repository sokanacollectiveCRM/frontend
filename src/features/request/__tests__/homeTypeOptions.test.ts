import { describe, expect, it } from 'vitest';
import {
  HOME_TYPE_OTHER_VALUE,
  HOME_TYPE_PREFER_NOT_VALUE,
  normalizeHomeTypeFromApi,
  selectSingleHomeType,
  singleHomeTypeFromApi,
  toggleHomeTypeSelection,
} from '../homeTypeOptions';

describe('homeTypeOptions', () => {
  describe('normalizeHomeTypeFromApi', () => {
    it('returns empty array for empty input', () => {
      expect(normalizeHomeTypeFromApi(null)).toEqual([]);
      expect(normalizeHomeTypeFromApi('')).toEqual([]);
      expect(normalizeHomeTypeFromApi([])).toEqual([]);
    });

    it('wraps a legacy single string', () => {
      expect(normalizeHomeTypeFromApi('Apartment')).toEqual(['Apartment']);
    });

    it('keeps option labels that contain commas as a single value', () => {
      expect(normalizeHomeTypeFromApi('Rent, apartment or house')).toEqual([
        'Rent, apartment or house',
      ]);
    });

    it('passes through arrays', () => {
      expect(normalizeHomeTypeFromApi(['Shelter or emergency housing'])).toEqual([
        'Shelter or emergency housing',
      ]);
    });
  });

  describe('selectSingleHomeType', () => {
    it('replaces the current selection with the new option', () => {
      expect(
        selectSingleHomeType(['Rent, apartment or house'], 'Transitional housing')
      ).toEqual(['Transitional housing']);
    });

    it('deselects when the same option is clicked again', () => {
      expect(
        selectSingleHomeType(['Rent, apartment or house'], 'Rent, apartment or house')
      ).toEqual([]);
    });
  });

  describe('singleHomeTypeFromApi', () => {
    it('returns only the first stored value for legacy multi-select rows', () => {
      expect(
        singleHomeTypeFromApi([
          'Rent, apartment or house',
          'Own, apartment, condo, or house',
        ])
      ).toEqual(['Rent, apartment or house']);
    });
  });

  describe('toggleHomeTypeSelection', () => {
    it('adds and removes regular options', () => {
      let current: string[] = [];
      current = toggleHomeTypeSelection(current, 'Transitional housing');
      expect(current).toEqual(['Transitional housing']);
      current = toggleHomeTypeSelection(current, 'Transitional housing');
      expect(current).toEqual([]);
    });

    it('selecting "Prefer not to answer" clears other selections', () => {
      const current = ['Rent, apartment or house', 'Own, apartment, condo, or house'];
      expect(toggleHomeTypeSelection(current, HOME_TYPE_PREFER_NOT_VALUE)).toEqual([
        HOME_TYPE_PREFER_NOT_VALUE,
      ]);
    });

    it('deselecting "Prefer not to answer" returns empty', () => {
      expect(
        toggleHomeTypeSelection([HOME_TYPE_PREFER_NOT_VALUE], HOME_TYPE_PREFER_NOT_VALUE)
      ).toEqual([]);
    });

    it('selecting another option removes "Prefer not to answer"', () => {
      const current = [HOME_TYPE_PREFER_NOT_VALUE];
      expect(toggleHomeTypeSelection(current, 'Experiencing homelessness')).toEqual([
        'Experiencing homelessness',
      ]);
    });

    it('deselecting Other does not require clearing other text (handled in form)', () => {
      const current = [HOME_TYPE_OTHER_VALUE];
      expect(toggleHomeTypeSelection(current, HOME_TYPE_OTHER_VALUE)).toEqual([]);
    });
  });
});
