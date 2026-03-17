import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import * as api from "@/lib/api";
import type { Packet, PacketSummary } from "@/lib/types";

const PDF_POLL_INTERVAL = 3000;

export function useAdminAuth() {
  const navigate = useNavigate();

  const isAuthenticated = !!sessionStorage.getItem("admin_pin");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("admin_pin");
    navigate("/admin");
  }, [navigate]);

  return { isAuthenticated, logout };
}

export function usePacketList() {
  const [packets, setPackets] = useState<PacketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPackets = useCallback(async () => {
    try {
      const data = await api.listPackets();
      setPackets(data.packets);
      setError(null);
    } catch {
      setError("Failed to load packets.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchPackets();
  }, [fetchPackets]);

  // Auto-poll when any packet has a pending/generating PDF status
  useEffect(() => {
    const hasPending = packets.some(
      (p) => p.pdf_status === "pending" || p.pdf_status === "generating",
    );

    if (hasPending && !pollingRef.current) {
      pollingRef.current = setInterval(fetchPackets, PDF_POLL_INTERVAL);
    } else if (!hasPending && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [packets, fetchPackets]);

  const removePacket = useCallback(
    async (id: string) => {
      await api.deletePacket(id);
      await fetchPackets();
    },
    [fetchPackets],
  );

  return { packets, loading, error, refetch: fetchPackets, removePacket };
}

export function useAdminPacket(id: string | undefined) {
  const [packet, setPacket] = useState<Packet | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getAdminPacket(id)
      .then(setPacket)
      .catch(() => setError("Failed to load packet."))
      .finally(() => setLoading(false));
  }, [id]);

  return { packet, loading, error };
}
