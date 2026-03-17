import { useParams } from "react-router";
import { usePacket } from "@/hooks/usePacket";
import { StudentPacketView } from "@/components/packet/StudentPacketView";

export function PrintPacket() {
  const { uuid } = useParams<{ uuid: string }>();
  const { packet, loading, error } = usePacket(uuid!);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !packet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <h1 className="text-xl font-semibold text-gray-700">
          Packet Not Found
        </h1>
      </div>
    );
  }

  return (
    <div className="print-mode bg-white">
      <StudentPacketView packet={packet} readOnly />
    </div>
  );
}
