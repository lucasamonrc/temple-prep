interface Props {
  note: string;
}

export function PersonalNote({ note }: Props) {
  return (
    <div className="bg-warm-white rounded-xl border border-gold/20 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-4">
        A Personal Note for You
      </h2>
      <p className="text-gray-700 leading-relaxed italic whitespace-pre-line">
        {note}
      </p>
    </div>
  );
}
