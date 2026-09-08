import { useState, useCallback } from 'react';

// Hook personalizado para manejar contadores y cantidades
export function useCounter(initialValue = 1, min = 1, max = 99) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => (max !== undefined ? Math.min(max, prev + 1) : prev + 1));
  }, [max]);

  const decrement = useCallback(() => {
    setCount(prev => (min !== undefined ? Math.max(min, prev - 1) : prev - 1));
  }, [min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const setValue = useCallback((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    if (min !== undefined && num < min) {
      setCount(min);
    } else if (max !== undefined && num > max) {
      setCount(max);
    } else {
      setCount(num);
    }
  }, [min, max]);

  return { count, increment, decrement, reset, setValue };
}

export default useCounter;
