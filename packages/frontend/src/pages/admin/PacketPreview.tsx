import { useParams, Link } from "react-router";
import { useAdminAuth, useAdminPacket } from "@/hooks/useAdmin";
import { StudentPacketView } from "@/components/packet/StudentPacketView";

export function PacketPreview() {
  useAdminAuth();
  const { id } = useParams<{ id: string }>();
  const { packet, loading, error } = useAdminPacket(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-500">Loading preview...</p>
      </div>
    );
  }

  if (error || !packet) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-red-600">Failed to load packet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2 text-center no-print">
        <p className="text-sm text-amber-800">
          Preview Mode &mdash; This is how the student will see their packet.
        </p>
        <Link
          to={`/admin/packets/${id}`}
          className="text-sm text-temple-blue hover:underline ml-2"
        >
          Back to Edit
        </Link>
      </div>

      <StudentPacketView packet={packet} readOnly />
    </div>
  );
}
