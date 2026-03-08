import { useState, useRef, useCallback } from "react";
import type { Escort } from "@/lib/types";
import * as api from "@/lib/api";

interface Props {
  packetId: string;
  escort: Escort | null;
  readOnly?: boolean;
}

export function EscortSection({ packetId, escort, readOnly }: Props) {
  const [form, setForm] = useState({
    name: escort?.name || "",
    phone: escort?.phone || "",
    email: escort?.email || "",
    relationship: escort?.relationship || "",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const save = useCallback(
    (data: typeof form) => {
      if (readOnly) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        api.updateEscort(packetId, data);
      }, 1000);
    },
    [packetId, readOnly],
  );

  function handleChange(field: keyof typeof form, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    save(updated);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-2">
        Your Temple Escort
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        A temple escort is an endowed member of the same sex who will accompany
        you during your first temple visit. They will sit with you and help
        guide you through your endowment.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="escort-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Escort Name
          </label>
          <input
            id="escort-name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={readOnly}
            className="input"
            placeholder="Who will accompany you?"
          />
        </div>
        <div>
          <label
            htmlFor="escort-phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Escort Phone
          </label>
          <input
            id="escort-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={readOnly}
            className="input"
            placeholder="(___) ___-____"
          />
        </div>
        <div>
          <label
            htmlFor="escort-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Escort Email
          </label>
          <input
            id="escort-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={readOnly}
            className="input"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="escort-relationship"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Relationship
          </label>
          <input
            id="escort-relationship"
            type="text"
            value={form.relationship}
            onChange={(e) => handleChange("relationship", e.target.value)}
            disabled={readOnly}
            className="input"
            placeholder="e.g., friend, leader, family member"
          />
        </div>
      </div>
    </div>
  );
}
