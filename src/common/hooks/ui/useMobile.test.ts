import { MOBILE_BREAKPOINT } from '@/common/hooks/ui/useMobile';
import { describe, expect, it } from 'vitest';

describe('useIsMobile breakpoint', () => {
  it('treats tablet 768 as mobile/hamburger (below Tailwind lg)', () => {
    expect(MOBILE_BREAKPOINT).toBe(1024);
    expect(768).toBeLessThan(MOBILE_BREAKPOINT);
    expect(1024).toBeGreaterThanOrEqual(MOBILE_BREAKPOINT);
  });
});
