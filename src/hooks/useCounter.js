import { useState, useEffect } from "react";

// ─── Counter hook ────────────────────────────────────────────
export function useCounter(target) {
  const [v, setV] = useState(target);
  useEffect(() => {
    let c = 0;
    const inc = target / 60;
    const timer = setInterval(() => {
      c += inc;
      if (c >= target) { clearInterval(timer); setV(target); return; }
      setV(Math.floor(c));
    }, 15);
    return () => clearInterval(timer);
  }, [target]);
  return v;
}
