import { getEventFormAttributes } from "../../../forms/data-access";
import { CreateEventFormModal } from "./form-modal";

export default async function CreateEventFormModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const attributes = await getEventFormAttributes(id);

  return <CreateEventFormModal eventId={id} attributes={attributes} />;
}
