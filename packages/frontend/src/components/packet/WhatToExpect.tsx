const STEPS = [
  "Arrive at the temple in Sunday attire at your scheduled time.",
  "You will likely meet briefly with a member of the temple presidency.",
  "Go to the dressing room and change into your white clothing and put on your garments.",
  "Receive the initiatory ordinance — a brief, sacred preparation (approximately 5–10 minutes).",
  "Receive your endowment alongside your escort. During the endowment you will receive instruction, make covenants, and be taught through symbols.",
  "The endowment concludes as you pass through the veil into the Celestial Room. You are free to remain there as long as you'd like to ponder and pray.",
];

export function WhatToExpect() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-2">
        Your Temple Day
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Here is a simple overview of what to expect on the day of your first
        temple visit.
      </p>

      <ol className="space-y-4">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-temple-blue/10 text-temple-blue text-sm flex items-center justify-center font-medium">
              {i + 1}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed pt-0.5">
              {step}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-6 p-4 bg-warm-white rounded-lg border border-gold/10">
        <p className="text-sm text-gray-600 italic leading-relaxed">
          &ldquo;Do not try to understand it all at once. Pay attention to what
          the Spirit will be telling you, and take your time to approach the
          Lord in the Celestial Room. As often as you return, you'll learn more
          and more and all will become very familiar to you.&rdquo;
        </p>
      </div>
    </div>
  );
}
