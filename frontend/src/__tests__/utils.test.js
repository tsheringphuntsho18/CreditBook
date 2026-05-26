import { describe, it, expect } from 'vitest';

// Sample utility function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const calculateBalance = (credits, debits) => {
  return credits - debits;
};

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format number to currency', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('$');
      expect(result).toContain('1,000');
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(99.99);
      expect(result).toContain('$');
      expect(result).toContain('99.99');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('$');
      expect(result).toContain('0');
    });
  });

  describe('calculateBalance', () => {
    it('should correctly calculate positive balance', () => {
      expect(calculateBalance(1000, 500)).toBe(500);
    });

    it('should correctly calculate negative balance', () => {
      expect(calculateBalance(500, 1000)).toBe(-500);
    });

    it('should handle zero balance', () => {
      expect(calculateBalance(500, 500)).toBe(0);
    });
  });
});
