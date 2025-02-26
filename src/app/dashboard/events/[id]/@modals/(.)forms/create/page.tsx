import { CreateEventFormModal } from "./form-modal";

export default async function CreateEventFormModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CreateEventFormModal eventId={id} />;
}
