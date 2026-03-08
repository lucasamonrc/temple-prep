interface Props {
  testimony: string;
  instructorName: string | null;
}

export function Testimony({ testimony, instructorName }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-4">
        A Word from Your Instructor
      </h2>
      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {testimony}
      </div>
      {instructorName && (
        <p className="mt-4 text-sm text-gray-500 italic">
          &mdash; {instructorName}
        </p>
      )}
    </div>
  );
}
