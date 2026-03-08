interface Props {
  studentName: string;
}

export function CoverPage({ studentName }: Props) {
  return (
    <div className="pt-12 pb-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
        <p className="text-sm uppercase tracking-widest text-gold-dark mb-3">
          Your
        </p>
        <h1 className="text-4xl sm:text-5xl font-serif text-temple-blue leading-tight">
          Temple Preparation
          <br />
          Packet
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-6" />
      </div>

      <p className="text-xl font-serif text-temple-blue-light mt-8">
        Prepared for
      </p>
      <p className="text-3xl font-serif text-temple-blue mt-2 font-medium">
        {studentName}
      </p>

      <div className="mt-12 max-w-md mx-auto">
        <blockquote className="text-sm italic text-gray-600 leading-relaxed">
          &ldquo;And inasmuch as my people build a house unto me in the name of
          the Lord, and do not suffer any unclean thing to come into it, that it
          be not defiled, my glory shall rest upon it; Yea, and my presence shall
          be there, for I will come into it, and all the pure in heart that
          shall come into it shall see God.&rdquo;
        </blockquote>
        <p className="text-xs text-gray-400 mt-2">
          Doctrine &amp; Covenants 97:15&ndash;16
        </p>
      </div>
    </div>
  );
}
