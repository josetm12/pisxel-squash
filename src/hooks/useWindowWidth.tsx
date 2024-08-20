import { useCallback, useState, useEffect } from 'react';
import { debounceFn } from '@/utils/helpers';

export default function useWindowWidth(debounceTime = 250) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  const debouncedHandleResize = useCallback(
    debounceFn(handleResize, debounceTime),
    [handleResize, debounceTime]
  );

  useEffect(() => {
    // Add event listener
    window.addEventListener('resize', debouncedHandleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, [debouncedHandleResize, handleResize]);

  return windowWidth;
}
