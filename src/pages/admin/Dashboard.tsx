import { useState } from "react";
import { Link } from "react-router";
import { useAdminAuth, usePacketList } from "@/hooks/useAdmin";
import { QRCodeSVG } from "qrcode.react";

export function AdminDashboard() {
  const { logout } = useAdminAuth();
  const { packets, loading, error, removePacket } = usePacketList();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function getStudentUrl(id: string) {
    return `${window.location.origin}/p/${id}`;
  }

  async function handleCopyLink(id: string) {
    await navigator.clipboard.writeText(getStudentUrl(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete(id: string) {
    setDeletingId(null);
    await removePacket(id);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif text-temple-blue">
              Temple Prep
            </h1>
            <p className="text-sm text-gray-500">Instructor Portal</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Student Packets
          </h2>
          <Link
            to="/admin/packets/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-temple-blue text-white rounded-lg text-sm font-medium hover:bg-temple-blue-dark transition-colors"
          >
            <span aria-hidden>+</span> Create New Packet
          </Link>
        </div>

        {/* State handling */}
        {loading && (
          <p className="text-gray-500 text-center py-12">
            Loading packets...
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center py-12">{error}</p>
        )}

        {!loading && !error && packets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 mb-2">No packets yet.</p>
            <Link
              to="/admin/packets/new"
              className="text-temple-blue hover:underline text-sm"
            >
              Create your first student packet
            </Link>
          </div>
        )}

        {/* Packet list */}
        {!loading && packets.length > 0 && (
          <div className="space-y-4">
            {packets.map((pkt) => (
              <div
                key={pkt.id}
                className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* QR Code */}
                  <div className="hidden sm:block shrink-0">
                    <QRCodeSVG
                      value={getStudentUrl(pkt.id)}
                      size={80}
                      level="M"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-serif text-temple-blue truncate">
                      {pkt.student_name}
                    </h3>
                    {pkt.student_pin && (
                      <p className="text-sm text-gray-600 mt-1" data-testid="packet-pin">
                        PIN: <span className="font-mono font-medium">{pkt.student_pin}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Created {formatDate(pkt.created_at)} &middot; Updated{" "}
                      {formatDate(pkt.updated_at)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                      /p/{pkt.id}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link
                      to={`/admin/packets/${pkt.id}`}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/admin/packets/${pkt.id}/preview`}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => handleCopyLink(pkt.id)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copiedId === pkt.id ? "Copied!" : "Copy Link"}
                    </button>
                    <button
                      onClick={() => setDeletingId(pkt.id)}
                      className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Delete confirmation */}
                {deletingId === pkt.id && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-red-700">
                      Delete {pkt.student_name}'s packet? This cannot be
                      undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(pkt.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
