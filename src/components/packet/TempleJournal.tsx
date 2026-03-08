import { useState } from "react";
import type { JournalEntry } from "@/lib/types";
import * as api from "@/lib/api";

interface Props {
  packetId: string;
  entries: JournalEntry[];
  readOnly?: boolean;
}

export function TempleJournal({
  packetId,
  entries: initialEntries,
  readOnly,
}: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [newEntry, setNewEntry] = useState({ content: "", date: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!newEntry.content.trim()) return;
    setSaving(true);
    try {
      const result = await api.createJournalEntry(packetId, {
        content: newEntry.content,
        entry_date: newEntry.date || undefined,
      });
      setEntries((prev) => [
        {
          id: result.id,
          packet_id: packetId,
          entry_date: newEntry.date || new Date().toISOString().split("T")[0],
          content: newEntry.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewEntry({ content: "", date: "" });
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entryId: number) {
    await api.deleteJournalEntry(packetId, entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-serif text-temple-blue">
          Record Your Temple Experience
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        After your temple visit, record your thoughts, feelings, and the
        impressions you received. You can add entries over time.
      </p>

      {!readOnly && !adding && (
        <button
          onClick={() => setAdding(true)}
          className="mb-6 px-4 py-2 text-sm bg-temple-blue text-white rounded-lg hover:bg-temple-blue-dark transition-colors"
        >
          + Add Entry
        </button>
      )}

      {adding && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
          <input
            type="date"
            value={newEntry.date}
            onChange={(e) =>
              setNewEntry((prev) => ({ ...prev, date: e.target.value }))
            }
            className="input"
          />
          <textarea
            data-testid="journal-content"
            value={newEntry.content}
            onChange={(e) =>
              setNewEntry((prev) => ({ ...prev, content: e.target.value }))
            }
            className="input min-h-[120px]"
            rows={5}
            placeholder="Write about your experience..."
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setAdding(false);
                setNewEntry({ content: "", date: "" });
              }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !newEntry.content.trim()}
              className="px-4 py-1.5 text-sm bg-temple-blue text-white rounded-lg hover:bg-temple-blue-dark disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && !adding && (
        <p className="text-sm text-gray-400 italic">
          No journal entries yet. After your temple visit, come back here to
          record your experience.
        </p>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 bg-warm-white rounded-lg border border-gold/10"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">
                {formatDate(entry.entry_date)}
              </p>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
