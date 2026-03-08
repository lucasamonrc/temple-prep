import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminAuth, useAdminPacket } from "@/hooks/useAdmin";
import * as api from "@/lib/api";
import type { MinisteringContact } from "@/lib/types";

interface FormData {
  student_name: string;
  testimony: string;
  personal_note: string;
  congratulations_message: string;
  temple_name: string;
  temple_phone: string;
  temple_url: string;
  bishop_name: string;
  bishop_phone: string;
  bishop_email: string;
  exec_secretary_name: string;
  exec_secretary_phone: string;
  exec_secretary_email: string;
  ministering_brothers: MinisteringContact[];
  ministering_sisters: MinisteringContact[];
  instructor_name: string;
  instructor_phone: string;
  instructor_email: string;
}

const INITIAL_DATA: FormData = {
  student_name: "",
  testimony: "",
  personal_note: "",
  congratulations_message: "",
  temple_name: "San Antonio Texas Temple",
  temple_phone: "(210) 937-5100",
  temple_url:
    "https://www.churchofjesuschrist.org/temples/details/san-antonio-texas-temple?lang=eng",
  bishop_name: "",
  bishop_phone: "",
  bishop_email: "",
  exec_secretary_name: "",
  exec_secretary_phone: "",
  exec_secretary_email: "",
  ministering_brothers: [{ name: "", phone: "" }],
  ministering_sisters: [{ name: "", phone: "" }],
  instructor_name: "",
  instructor_phone: "",
  instructor_email: "",
};

function parseContacts(json: string | null): MinisteringContact[] {
  if (!json) return [{ name: "", phone: "" }];
  try {
    const parsed = JSON.parse(json);
    return parsed.length > 0 ? parsed : [{ name: "", phone: "" }];
  } catch {
    return [{ name: "", phone: "" }];
  }
}

export function PacketForm() {
  useAdminAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { packet, loading: loadingPacket } = useAdminPacket(id);
  const [form, setForm] = useState<FormData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (packet) {
      setForm({
        student_name: packet.student_name || "",
        testimony: packet.testimony || "",
        personal_note: packet.personal_note || "",
        congratulations_message: packet.congratulations_message || "",
        temple_name: packet.temple_name || "San Antonio Texas Temple",
        temple_phone: packet.temple_phone || "",
        temple_url: packet.temple_url || "",
        bishop_name: packet.bishop_name || "",
        bishop_phone: packet.bishop_phone || "",
        bishop_email: packet.bishop_email || "",
        exec_secretary_name: packet.exec_secretary_name || "",
        exec_secretary_phone: packet.exec_secretary_phone || "",
        exec_secretary_email: packet.exec_secretary_email || "",
        ministering_brothers: parseContacts(packet.ministering_brothers),
        ministering_sisters: parseContacts(packet.ministering_sisters),
        instructor_name: packet.instructor_name || "",
        instructor_phone: packet.instructor_phone || "",
        instructor_email: packet.instructor_email || "",
      });
    }
  }, [packet]);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateContact(
    field: "ministering_brothers" | "ministering_sisters",
    index: number,
    key: keyof MinisteringContact,
    value: string,
  ) {
    setForm((prev) => {
      const contacts = [...prev[field]];
      contacts[index] = { ...contacts[index], [key]: value };
      return { ...prev, [field]: contacts };
    });
  }

  function addContact(field: "ministering_brothers" | "ministering_sisters") {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], { name: "", phone: "" }],
    }));
  }

  function removeContact(
    field: "ministering_brothers" | "ministering_sisters",
    index: number,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.student_name.trim()) {
      setError("Student name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = {
        ...form,
        ministering_brothers: form.ministering_brothers.filter(
          (c) => c.name.trim(),
        ),
        ministering_sisters: form.ministering_sisters.filter(
          (c) => c.name.trim(),
        ),
      };

      if (isEdit) {
        await api.updatePacket(id, data);
      } else {
        await api.createPacket(data);
      }
      navigate("/admin/dashboard");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (isEdit && loadingPacket) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-500">Loading packet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-serif text-temple-blue">
            {isEdit ? "Edit Packet" : "Create New Packet"}
          </h1>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Info */}
          <Section title="Student Information">
            <Field label="Student Name" required>
              <input
                type="text"
                value={form.student_name}
                onChange={(e) => updateField("student_name", e.target.value)}
                className="input"
                placeholder="e.g., John Smith"
              />
            </Field>
          </Section>

          {/* Your Message */}
          <Section title="Your Message">
            <Field label="Congratulations Message" hint="Leave blank to use the default message.">
              <textarea
                value={form.congratulations_message}
                onChange={(e) =>
                  updateField("congratulations_message", e.target.value)
                }
                className="input min-h-[80px]"
                rows={3}
                placeholder="Congratulations on completing the Temple Preparation course!..."
              />
            </Field>
            <Field label="Your Personal Testimony">
              <textarea
                value={form.testimony}
                onChange={(e) => updateField("testimony", e.target.value)}
                className="input min-h-[120px]"
                rows={5}
                placeholder="Share your testimony about the temple..."
              />
            </Field>
            <Field label="Personal Note to This Student" hint="This is what makes each packet unique.">
              <textarea
                value={form.personal_note}
                onChange={(e) => updateField("personal_note", e.target.value)}
                className="input min-h-[100px]"
                rows={4}
                placeholder="A personal message for this specific student..."
              />
            </Field>
          </Section>

          {/* Temple */}
          <Section title="Temple">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Temple Name">
                <input
                  type="text"
                  value={form.temple_name}
                  onChange={(e) => updateField("temple_name", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Temple Phone">
                <input
                  type="tel"
                  value={form.temple_phone}
                  onChange={(e) => updateField("temple_phone", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          </Section>

          {/* Bishop */}
          <Section title="Bishop">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Bishop Name">
                <input
                  type="text"
                  value={form.bishop_name}
                  onChange={(e) => updateField("bishop_name", e.target.value)}
                  className="input"
                  placeholder="Bishop..."
                />
              </Field>
              <Field label="Bishop Phone">
                <input
                  type="tel"
                  value={form.bishop_phone}
                  onChange={(e) => updateField("bishop_phone", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Bishop Email">
                <input
                  type="email"
                  value={form.bishop_email}
                  onChange={(e) => updateField("bishop_email", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          </Section>

          {/* Executive Secretary */}
          <Section title="Executive Secretary">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Name">
                <input
                  type="text"
                  value={form.exec_secretary_name}
                  onChange={(e) =>
                    updateField("exec_secretary_name", e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={form.exec_secretary_phone}
                  onChange={(e) =>
                    updateField("exec_secretary_phone", e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.exec_secretary_email}
                  onChange={(e) =>
                    updateField("exec_secretary_email", e.target.value)
                  }
                  className="input"
                />
              </Field>
            </div>
          </Section>

          {/* Ministering Brothers */}
          <Section title="Ministering Brothers">
            <ContactList
              contacts={form.ministering_brothers}
              field="ministering_brothers"
              onUpdate={updateContact}
              onAdd={addContact}
              onRemove={removeContact}
            />
          </Section>

          {/* Ministering Sisters */}
          <Section title="Ministering Sisters">
            <ContactList
              contacts={form.ministering_sisters}
              field="ministering_sisters"
              onUpdate={updateContact}
              onAdd={addContact}
              onRemove={removeContact}
            />
          </Section>

          {/* Instructor */}
          <Section title="Instructor (You)">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Your Name">
                <input
                  type="text"
                  value={form.instructor_name}
                  onChange={(e) =>
                    updateField("instructor_name", e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="Your Phone">
                <input
                  type="tel"
                  value={form.instructor_phone}
                  onChange={(e) =>
                    updateField("instructor_phone", e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="Your Email">
                <input
                  type="email"
                  value={form.instructor_email}
                  onChange={(e) =>
                    updateField("instructor_email", e.target.value)
                  }
                  className="input"
                />
              </Field>
            </div>
          </Section>

          {/* Submit */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm bg-temple-blue text-white rounded-lg font-medium hover:bg-temple-blue-dark disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Packet"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Reusable form components

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-serif text-temple-blue mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div>{children}</div>
    </div>
  );
}

function ContactList({
  contacts,
  field,
  onUpdate,
  onAdd,
  onRemove,
}: {
  contacts: MinisteringContact[];
  field: "ministering_brothers" | "ministering_sisters";
  onUpdate: (
    field: "ministering_brothers" | "ministering_sisters",
    index: number,
    key: keyof MinisteringContact,
    value: string,
  ) => void;
  onAdd: (field: "ministering_brothers" | "ministering_sisters") => void;
  onRemove: (
    field: "ministering_brothers" | "ministering_sisters",
    index: number,
  ) => void;
}) {
  return (
    <div className="space-y-3">
      {contacts.map((contact, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input
            type="text"
            value={contact.name}
            onChange={(e) => onUpdate(field, i, "name", e.target.value)}
            className="input flex-1"
            placeholder="Name"
          />
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => onUpdate(field, i, "phone", e.target.value)}
            className="input flex-1"
            placeholder="Phone"
          />
          {contacts.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(field, i)}
              className="p-2 text-red-400 hover:text-red-600 shrink-0"
              aria-label="Remove contact"
            >
              &times;
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAdd(field)}
        className="text-sm text-temple-blue hover:underline"
      >
        + Add another
      </button>
    </div>
  );
}
