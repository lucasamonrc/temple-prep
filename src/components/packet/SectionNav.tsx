const SECTIONS = [
  { id: "cover", label: "Top" },
  { id: "goals", label: "Goals" },
  { id: "escort", label: "Escort" },
  { id: "spiritual", label: "Resources" },
  { id: "reflections", label: "Reflect" },
  { id: "journal", label: "Journal" },
  { id: "todos", label: "To-Do" },
  { id: "contacts", label: "Contacts" },
];

export function SectionNav() {
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden no-print z-40">
      <div className="flex overflow-x-auto py-2 px-2 gap-1">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 hover:text-temple-blue hover:bg-gray-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
