import type { Packet } from "@/lib/types";
import { CoverPage } from "./CoverPage";
import { Congratulations } from "./Congratulations";
import { Testimony } from "./Testimony";
import { PersonalNote } from "./PersonalNote";
import { GoalTable } from "./GoalTable";
import { EscortSection } from "./EscortSection";
import { SpiritualResources } from "./SpiritualResources";
import { ReflectionQuestions } from "./ReflectionQuestions";
import { TempleJournal } from "./TempleJournal";
import { WhatToExpect } from "./WhatToExpect";
import { TodoChecklist } from "./TodoChecklist";
import { ContactsSection } from "./ContactsSection";
import { ClosingEncouragement } from "./ClosingEncouragement";
import { SectionNav } from "./SectionNav";

interface Props {
  packet: Packet;
  readOnly?: boolean;
}

export function StudentPacketView({ packet, readOnly = false }: Props) {
  return (
    <div className="min-h-screen bg-cream pb-20 sm:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <section id="cover">
          <CoverPage studentName={packet.student_name} />
        </section>

        <section id="congratulations" className="mt-8">
          <Congratulations message={packet.congratulations_message} />
        </section>

        {packet.testimony && (
          <section id="testimony" className="mt-8">
            <Testimony
              testimony={packet.testimony}
              instructorName={packet.instructor_name}
            />
          </section>
        )}

        {packet.personal_note && (
          <section id="personal-note" className="mt-8">
            <PersonalNote note={packet.personal_note} />
          </section>
        )}

        <section id="goals" className="mt-8">
          <GoalTable
            packetId={packet.id}
            goals={packet.goals}
            readOnly={readOnly}
          />
        </section>

        <section id="escort" className="mt-8">
          <EscortSection
            packetId={packet.id}
            escort={packet.escort}
            readOnly={readOnly}
          />
        </section>

        <section id="spiritual" className="mt-8">
          <SpiritualResources />
        </section>

        <section id="reflections" className="mt-8">
          <ReflectionQuestions
            packetId={packet.id}
            reflections={packet.reflections}
            readOnly={readOnly}
          />
        </section>

        <section id="journal" className="mt-8">
          <TempleJournal
            packetId={packet.id}
            entries={packet.journal}
            readOnly={readOnly}
          />
        </section>

        <section id="expect" className="mt-8">
          <WhatToExpect />
        </section>

        <section id="todos" className="mt-8">
          <TodoChecklist
            packetId={packet.id}
            todos={packet.todos}
            readOnly={readOnly}
          />
        </section>

        <section id="contacts" className="mt-8">
          <ContactsSection packet={packet} />
        </section>

        <section id="closing" className="mt-8 mb-8">
          <ClosingEncouragement />
        </section>
      </div>

      {!readOnly && <SectionNav />}
    </div>
  );
}
