import { useState, useEffect } from "react";
import * as api from "@/lib/api";
import type { Packet } from "@/lib/types";

export function usePacket(uuid: string) {
  const [packet, setPacket] = useState<Packet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getPacket(uuid)
      .then((data) => {
        setPacket(data);
      })
      .catch(() => {
        setError("Failed to load packet.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [uuid]);

  return { packet, loading, error };
}
