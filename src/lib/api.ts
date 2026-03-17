const API_BASE = "/api";

function getAdminHeaders(): HeadersInit {
  const pin = sessionStorage.getItem("admin_pin");
  return {
    "Content-Type": "application/json",
    ...(pin ? { Authorization: `Bearer ${pin}` } : {}),
  };
}

// Admin API

export async function adminLogin(pin: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  return res.ok;
}

export async function listPackets() {
  const res = await fetch(`${API_BASE}/admin/packets`, {
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch packets");
  return res.json();
}

export async function getAdminPacket(id: string) {
  const res = await fetch(`${API_BASE}/admin/packets/${id}`, {
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch packet");
  return res.json();
}

export async function createPacket(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/admin/packets`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create packet");
  return res.json();
}

export async function updatePacket(
  id: string,
  data: Record<string, unknown>,
) {
  const res = await fetch(`${API_BASE}/admin/packets/${id}`, {
    method: "PUT",
    headers: getAdminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update packet");
  return res.json();
}

export async function deletePacket(id: string) {
  const res = await fetch(`${API_BASE}/admin/packets/${id}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete packet");
  return res.json();
}

export async function generatePdf(
  id: string,
): Promise<{ status: string; workflow_id: string }> {
  const res = await fetch(`${API_BASE}/admin/packets/${id}/pdf`, {
    method: "POST",
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to trigger PDF generation");
  return res.json();
}

export function getPdfDownloadUrl(id: string): string {
  return `${API_BASE}/admin/packets/${id}/pdf`;
}

// Student API

export async function lookupPacket(
  first_name: string,
  last_name: string,
  pin: string,
): Promise<{ uuid: string } | null> {
  const res = await fetch(`${API_BASE}/packets/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name, pin }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to lookup packet");
  return res.json();
}

export async function getPacket(uuid: string) {
  const res = await fetch(`${API_BASE}/packets/${uuid}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch packet");
  return res.json();
}

export async function updateGoal(
  uuid: string,
  goalType: string,
  data: { scheduled_date?: string; completed?: boolean; notes?: string },
) {
  const res = await fetch(`${API_BASE}/packets/${uuid}/goals/${goalType}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update goal");
  return res.json();
}

export async function updateEscort(
  uuid: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  },
) {
  const res = await fetch(`${API_BASE}/packets/${uuid}/escort`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update escort");
  return res.json();
}

export async function updateReflection(
  uuid: string,
  key: string,
  response: string,
) {
  const res = await fetch(`${API_BASE}/packets/${uuid}/reflections/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response }),
  });
  if (!res.ok) throw new Error("Failed to update reflection");
  return res.json();
}

export async function createJournalEntry(
  uuid: string,
  data: { entry_date?: string; content: string },
) {
  const res = await fetch(`${API_BASE}/packets/${uuid}/journal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create journal entry");
  return res.json();
}

export async function updateJournalEntry(
  uuid: string,
  entryId: number,
  data: { entry_date?: string; content?: string },
) {
  const res = await fetch(`${API_BASE}/packets/${uuid}/journal/${entryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update journal entry");
  return res.json();
}

export async function deleteJournalEntry(uuid: string, entryId: number) {
  const res = await fetch(`${API_BASE}/packets/${uuid}/journal/${entryId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete journal entry");
  return res.json();
}

export async function toggleTodo(
  uuid: string,
  todoId: number,
  completed: boolean,
) {
  const res = await fetch(`${API_BASE}/packets/${uuid}/todos/${todoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to toggle todo");
  return res.json();
}
