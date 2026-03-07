interface Props {
  message: string | null;
}

const DEFAULT_MESSAGE =
  "Congratulations on completing the Temple Preparation course! This is a wonderful milestone on your covenant journey. You have prepared yourself to enter the House of the Lord, and the blessings that await you there are real and eternal.";

export function Congratulations({ message }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-4">
        Congratulations
      </h2>
      <p className="text-gray-700 leading-relaxed">
        {message || DEFAULT_MESSAGE}
      </p>
    </div>
  );
}
