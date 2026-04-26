import { useState, useCallback } from 'react'
import { genId } from '../utils'

export function useToast() {
  const [list, set] = useState([]);
  const show = useCallback((msg, type="success") => {
    const id = genId();
    set(p => [...p, {id, msg, type}]);
    setTimeout(() => set(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  return { list, show };
}
