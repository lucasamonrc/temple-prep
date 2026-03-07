import type { Packet, MinisteringContact } from "@/lib/types";

interface Props {
  packet: Packet;
}

function parseContacts(json: string | null): MinisteringContact[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function ContactCard({
  title,
  name,
  phone,
  email,
}: {
  title: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}) {
  if (!name) return null;
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        {title}
      </p>
      <p className="text-sm font-medium text-gray-800">{name}</p>
      {phone && (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className="text-sm text-temple-blue hover:underline block mt-1"
        >
          {phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="text-sm text-temple-blue hover:underline block mt-0.5"
        >
          {email}
        </a>
      )}
    </div>
  );
}

function ContactGroup({
  title,
  contacts,
}: {
  title: string;
  contacts: MinisteringContact[];
}) {
  if (contacts.length === 0) return null;
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="space-y-2">
        {contacts.map((c, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-gray-800">{c.name}</p>
            {c.phone && (
              <a
                href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                className="text-sm text-temple-blue hover:underline block"
              >
                {c.phone}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactsSection({ packet }: Props) {
  const brothers = parseContacts(packet.ministering_brothers);
  const sisters = parseContacts(packet.ministering_sisters);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-6">
        Your Contacts
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ContactCard
          title="Bishop"
          name={packet.bishop_name}
          phone={packet.bishop_phone}
          email={packet.bishop_email}
        />
        <ContactCard
          title="Executive Secretary"
          name={packet.exec_secretary_name}
          phone={packet.exec_secretary_phone}
          email={packet.exec_secretary_email}
        />
        <ContactGroup title="Ministering Brothers" contacts={brothers} />
        <ContactGroup title="Ministering Sisters" contacts={sisters} />
        <ContactCard
          title="Temple Prep Instructor"
          name={packet.instructor_name}
          phone={packet.instructor_phone}
          email={packet.instructor_email}
        />
      </div>
    </div>
  );
}
