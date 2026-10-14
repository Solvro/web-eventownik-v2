import { SortableEmailGrid } from "@/app/dashboard/events/[uuid]/emails/sortable-email-grid";
import { SortableFormGrid } from "@/app/dashboard/events/[uuid]/forms/sortable-form-grid";
import { EventCard } from "@/components/event-card";
import type { EventEmail } from "@/types/emails";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

const eventUuid = "00000000-0000-0000-0000-000000000000";

const forms: EventForm[] = [
  "Zapisy na warsztaty",
  "Formularz test",
  "Rejestracja z bardzo długą nazwą, która powinna się zawinąć do dwóch linii",
].map((name, index) => ({
  uuid: `form-${index.toString()}`,
  eventUuid,
  isOpen: index === 0,
  isFirstForm: index === 2,
  description: "",
  name,
  slug: `form-${index.toString()}`,
  openDate: null,
  closeDate: null,
  openCondition: "MANUAL",
  order: index,
  attributes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const emails: EventEmail[] = ["Potwierdzenie rejestracji", "Przypomnienie"].map(
  (name, index) => ({
    uuid: `email-${index.toString()}`,
    eventUuid,
    name,
    trigger: "participant_registered",
    triggerValue: null,
    order: index,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: { failedCount: "0", pendingCount: "0", sentCount: "0" },
  }),
);

const event: Event = {
  uuid: eventUuid,
  organizerUuid: eventUuid,
  name: "Testowe wydarzenie",
  description: null,
  slug: "testowe-wydarzenie",
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  firstFormId: "",
  location: null,
  primaryColor: null,
  organizer: null,
  participantsCount: 42,
  contactEmail: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  photoUrl: null,
  registerForm: null,
  links: [],
  isActive: true,
  attributes: [],
};

export default function TilePreviewPage() {
  return (
    <div className="container mx-auto flex flex-col gap-12 p-8">
      <h1 className="text-3xl font-bold">Formularze</h1>
      <SortableFormGrid forms={forms} eventUuid={eventUuid} />

      <h1 className="text-3xl font-bold">Szablony maili</h1>
      <SortableEmailGrid templates={emails} eventUuid={eventUuid} />

      <h1 className="text-3xl font-bold">Wydarzenia</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EventCard event={event} />
      </div>
    </div>
  );
}
