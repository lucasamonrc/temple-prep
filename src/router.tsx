import { Routes, Route, Navigate } from "react-router";

import { AdminLogin } from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { PacketForm } from "./pages/admin/PacketForm";
import { PacketPreview } from "./pages/admin/PacketPreview";
import { StudentPacket } from "./pages/student/Packet";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/packets/new" element={<PacketForm />} />
      <Route path="/admin/packets/:id" element={<PacketForm />} />
      <Route path="/admin/packets/:id/preview" element={<PacketPreview />} />

      {/* Student packet (public) */}
      <Route path="/p/:uuid" element={<StudentPacket />} />
    </Routes>
  );
}
