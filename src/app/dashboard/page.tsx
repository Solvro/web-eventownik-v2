import { CreateEventForm } from "./(create-event)/create-event-form";

export default function DashboardHomepage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Panel organizatora</h1>
      <CreateEventForm />
    </div>
  );
}
