import { getTimeString } from './date.util';

describe('date utility test', () => {
  describe('getTimeString test', () => {
    it('should return correcly formatted date', () => {
      expect(getTimeString(new Date('1970-01-01T00:03:04.123Z'))).toBe(
        '07:03:04.123',
      );
      expect(getTimeString(new Date('2024-10-15T07:10:32.333Z'))).toBe(
        '14:10:32.333',
      );
    });
  });
});
