import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import * as api from "@/lib/api";

export function StudentLookup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError("Please enter your 4-6 digit PIN.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.lookupPacket(firstName.trim(), lastName.trim(), pin);
      if (!result) {
        setError("No packet found. Please check your name and PIN.");
        return;
      }
      navigate(`/p/${result.uuid}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-temple-blue mb-2">
            Temple Preparation
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your name and PIN to access your packet.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input"
              placeholder="John"
              autoComplete="given-name"
              data-testid="lookup-first-name"
            />
          </div>

          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input"
              placeholder="Smith"
              autoComplete="family-name"
              data-testid="lookup-last-name"
            />
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
              PIN
            </label>
            <input
              id="pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4,6}"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="input max-w-[200px]"
              placeholder="1234"
              autoComplete="off"
              data-testid="lookup-pin"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm" data-testid="lookup-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-temple-blue text-white rounded-lg font-medium hover:bg-temple-blue-dark disabled:opacity-50 transition-colors"
            data-testid="lookup-submit"
          >
            {loading ? "Looking up..." : "Access My Packet"}
          </button>
        </form>

        {/* Admin link */}
        <p className="text-center mt-6 text-xs text-gray-400">
          <Link to="/admin" className="hover:text-gray-600 transition-colors">
            Instructor Login
          </Link>
        </p>
      </div>
    </div>
  );
}
