import { useState, useEffect } from "react";

export function useAIStatus() {
  const [enabled, setEnabled] = useState<boolean>(true); // assume true to avoid flash of disabled state, then update
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.enabled);
        setLoading(false);
      })
      .catch(() => {
        setEnabled(false);
        setLoading(false);
      });
  }, []);

  return { enabled, loading };
}
