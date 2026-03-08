import {
  GENERAL_CONFERENCE_TALKS,
  KEY_SCRIPTURES,
} from "@/lib/constants";

export function SpiritualResources() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-2">
        Prepare Your Heart and Mind
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        These resources will help you prepare spiritually for your temple
        experience. Read or listen to them prayerfully.
      </p>

      {/* General Conference Talks */}
      <h3 className="text-lg font-serif text-temple-blue-light mb-4">
        General Conference Talks
      </h3>
      <div className="space-y-4 mb-8">
        {GENERAL_CONFERENCE_TALKS.map((talk, i) => (
          <div
            key={i}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <a
              href={talk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-temple-blue hover:underline leading-snug block"
            >
              &ldquo;{talk.title}&rdquo;
            </a>
            <p className="text-xs text-gray-500 mt-1">
              {talk.speaker} &middot; {talk.conference}
            </p>
            <p className="text-xs text-gray-400 mt-1">{talk.summary}</p>
          </div>
        ))}
      </div>

      {/* Key Scriptures */}
      <h3 className="text-lg font-serif text-temple-blue-light mb-4">
        Key Scriptures
      </h3>
      <div className="space-y-4">
        {KEY_SCRIPTURES.map((scripture, i) => (
          <div
            key={i}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <a
              href={scripture.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-temple-blue hover:underline block"
            >
              {scripture.reference}
            </a>
            <p className="text-xs text-gray-400 mt-1">{scripture.theme}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
