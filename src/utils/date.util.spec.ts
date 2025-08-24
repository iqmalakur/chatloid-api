import { getTimeString, zeroPadding } from './date.util';

describe('date utility test', () => {
  describe('zeroPadding test', () => {
    it('should return correctly padded string', () => {
      expect(zeroPadding(5)).toBe('05');
      expect(zeroPadding(7, 3)).toBe('007');
      expect(zeroPadding(77, 3)).toBe('077');
      expect(zeroPadding(777, 3)).toBe('777');
      expect(zeroPadding(7777, 3)).toBe('7777');
      expect(zeroPadding(123, 2)).toBe('123');
      expect(zeroPadding('9', 4)).toBe('0009');
    });
  });

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
