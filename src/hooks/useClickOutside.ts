import { useEffect, MouseEvent } from 'react';

// Improved version of https://usehooks.com/useOnClickOutside/
const useClickOutside = (ref: any, handler: any) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (_: HTMLElement, ev: Event): any => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(ev.target)) return;

      handler(ev);
    };

    const validateEventStart = (_: HTMLElement, ev: Event): any => {
      startedWhenMounted = ref.current;
      startedInside = ref.current && ref.current.contains(ev.target);
    };

    document.addEventListener('mousedown', validateEventStart as any);
    document.addEventListener('touchstart', validateEventStart as any);
    document.addEventListener('click', listener as any);

    return () => {
      document.removeEventListener('mousedown', validateEventStart as any);
      document.removeEventListener('touchstart', validateEventStart as any);
      document.removeEventListener('click', listener as any);
    };
  }, [ref, handler]);
};

export default useClickOutside;
