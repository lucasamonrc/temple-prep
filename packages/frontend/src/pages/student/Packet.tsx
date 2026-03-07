import { useParams } from "react-router";

export function StudentPacket() {
  const { uuid } = useParams<{ uuid: string }>();

  return (
    <div className="min-h-screen bg-cream p-4">
      <h1 className="text-2xl font-serif text-temple-blue">
        Temple Preparation Packet
      </h1>
      <p className="text-gray-500 mt-2">Packet ID: {uuid}</p>
    </div>
  );
}
