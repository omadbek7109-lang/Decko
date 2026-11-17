import { useEffect, useState } from 'react';

/** Current viewport size, capped to the app's max content width. */
export function useViewport(maxWidth = 480): { width: number; height: number } {
  const read = () => ({ width: Math.min(window.innerWidth, maxWidth), height: window.innerHeight });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const onResize = () => setSize(read());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [maxWidth]);
  return size;
}
