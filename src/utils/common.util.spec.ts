import { zeroPadding } from './common.util';

describe('common utility test', () => {
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
});
