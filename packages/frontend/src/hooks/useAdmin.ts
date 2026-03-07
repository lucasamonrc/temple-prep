import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import * as api from "@/lib/api";
import type { Packet } from "@/lib/types";

interface PacketSummary {
  id: string;
  student_name: string;
  created_at: string;
  updated_at: string;
}

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

  const fetchPackets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listPackets();
      setPackets(data.packets);
    } catch {
      setError("Failed to load packets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackets();
  }, [fetchPackets]);

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
