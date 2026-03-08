import { useParams } from "react-router";
import { usePacket } from "@/hooks/usePacket";
import { StudentPacketView } from "@/components/packet/StudentPacketView";

export function StudentPacket() {
  const { uuid } = useParams<{ uuid: string }>();
  const { packet, loading, error } = usePacket(uuid!);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Loading your packet...</p>
        </div>
      </div>
    );
  }

  if (error || !packet) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-serif text-temple-blue mb-3">
            Packet Not Found
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            This packet was not found. Please check the link you received from
            your temple preparation instructor.
          </p>
        </div>
      </div>
    );
  }

  return <StudentPacketView packet={packet} />;
}
