import { useState, useRef, useCallback } from "react";
import type { Reflection } from "@/lib/types";
import { REFLECTION_QUESTIONS } from "@/lib/constants";
import * as api from "@/lib/api";

interface Props {
  packetId: string;
  reflections: Reflection[];
  readOnly?: boolean;
}

export function ReflectionQuestions({
  packetId,
  reflections,
  readOnly,
}: Props) {
  const [responses, setResponses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const r of reflections) {
      map[r.question_key] = r.response || "";
    }
    return map;
  });
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const save = useCallback(
    (key: string, value: string) => {
      if (readOnly) return;
      if (timersRef.current[key]) clearTimeout(timersRef.current[key]);
      timersRef.current[key] = setTimeout(() => {
        api.updateReflection(packetId, key, value);
      }, 1000);
    },
    [packetId, readOnly],
  );

  function handleChange(key: string, value: string) {
    setResponses((prev) => ({ ...prev, [key]: value }));
    save(key, value);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-2">
        Prepare to Approach the Lord
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Take some time to ponder these questions. Your responses are saved
        automatically and are for your eyes only.
      </p>

      <div className="space-y-6">
        {Object.entries(REFLECTION_QUESTIONS).map(([key, question]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question}
            </label>
            <textarea
              data-testid={`reflection-${key}`}
              value={responses[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              disabled={readOnly}
              className="input min-h-[100px]"
              rows={4}
              placeholder="Write your thoughts here..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
