import { EventsPageContent } from "./components/events-page-content";

export const metadata = {
  title: "Wydarzenia | Eventownik Solvro",
  description:
    "Przeglądaj nadchodzące wydarzenia organizowane przez społeczność Eventownika. Znajdź imprezy, integracje, wyjazdy i więcej!",
};

export default function EventsPage() {
  return (
    <div className="flex w-full flex-col items-center py-4">
      <EventsPageContent />
    </div>
  );
}
