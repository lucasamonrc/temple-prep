import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

export function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        sessionStorage.setItem("admin_pin", pin);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid PIN. Please try again.");
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-temple-blue mb-2">
            Temple Prep
          </h1>
          <p className="text-sm text-gray-500">Instructor Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="pin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-blue focus:border-transparent outline-none text-center text-lg tracking-widest"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-3 bg-temple-blue text-white rounded-lg font-medium hover:bg-temple-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
