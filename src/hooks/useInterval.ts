import { useRef, useEffect } from 'react';

// reference: https://usehooks-ts.com/react-hook/use-interval
/* 
Store the callback with a ref, whenever the delay changes, 
we can create a new interval with a useEffect
If the delay was null, no interval gets created and on clean up, 
we clear out the interval to stop it from running
*/
export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay == null) return;

    const intervalID = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(intervalID);
  }, [delay]);
}