import { Routes, Route } from "react-router";

import { AdminLogin } from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { PacketForm } from "./pages/admin/PacketForm";
import { PacketPreview } from "./pages/admin/PacketPreview";
import { StudentLookup } from "./pages/student/Lookup";
import { StudentPacket } from "./pages/student/Packet";
import { PrintPacket } from "./pages/print/PrintPacket";

export function AppRoutes() {
  return (
    <Routes>
      {/* Student lookup (landing page) */}
      <Route path="/" element={<StudentLookup />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/packets/new" element={<PacketForm />} />
      <Route path="/admin/packets/:id" element={<PacketForm />} />
      <Route path="/admin/packets/:id/preview" element={<PacketPreview />} />

      {/* Student packet (public, direct UUID link) */}
      <Route path="/p/:uuid" element={<StudentPacket />} />

      {/* Print-optimized packet (used by PDF generation) */}
      <Route path="/print/:uuid" element={<PrintPacket />} />
    </Routes>
  );
}
