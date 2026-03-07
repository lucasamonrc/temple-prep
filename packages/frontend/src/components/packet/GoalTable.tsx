import { useState } from "react";
import type { Goal } from "@/lib/types";
import * as api from "@/lib/api";

interface Props {
  packetId: string;
  goals: Goal[];
  readOnly?: boolean;
}

const GOAL_LABELS: Record<string, string> = {
  bishop_interview: "Recommend Interview with Bishop",
  stake_interview: "Recommend Interview with Stake President",
  temple_appointment: "Temple Appointment",
};

export function GoalTable({ packetId, goals: initialGoals, readOnly }: Props) {
  const [goals, setGoals] = useState(initialGoals);

  async function handleDateChange(goalType: string, date: string) {
    setGoals((prev) =>
      prev.map((g) =>
        g.goal_type === goalType ? { ...g, scheduled_date: date } : g,
      ),
    );
    if (!readOnly) {
      await api.updateGoal(packetId, goalType, { scheduled_date: date });
    }
  }

  async function handleCompletedChange(goalType: string, completed: boolean) {
    setGoals((prev) =>
      prev.map((g) =>
        g.goal_type === goalType ? { ...g, completed: completed ? 1 : 0 } : g,
      ),
    );
    if (!readOnly) {
      await api.updateGoal(packetId, goalType, { completed });
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-2">
        Your Path to the Temple
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Set dates for these key milestones and check them off as you complete
        each one.
      </p>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.goal_type}
            data-testid={`goal-${goal.goal_type}`}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border transition-colors ${
              goal.completed
                ? "bg-sage-light/10 border-sage/30"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={!!goal.completed}
                onChange={(e) =>
                  handleCompletedChange(goal.goal_type, e.target.checked)
                }
                disabled={readOnly}
                className="w-5 h-5 shrink-0 accent-sage rounded"
              />
              <span
                className={`text-sm font-medium ${
                  goal.completed
                    ? "line-through text-gray-400"
                    : "text-gray-700"
                }`}
              >
                {GOAL_LABELS[goal.goal_type]}
              </span>
            </div>
            <input
              type="date"
              value={goal.scheduled_date || ""}
              onChange={(e) =>
                handleDateChange(goal.goal_type, e.target.value)
              }
              onBlur={(e) =>
                handleDateChange(goal.goal_type, e.target.value)
              }
              disabled={readOnly}
              className="input w-full sm:w-auto sm:min-w-[160px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
