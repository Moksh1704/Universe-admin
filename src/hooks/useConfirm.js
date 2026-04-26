import { useState } from 'react'

export function useConfirm() {
  const [s, set] = useState(null);
  const ask    = (msg, cb) => set({msg, cb});
  const ok     = () => { if(s) s.cb(); set(null); };
  const cancel = () => set(null);
  return { s, ask, ok, cancel };
}
