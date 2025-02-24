import type { Event } from "@/types/event";

export default async function EventsPage() {
  const data = await getEvents();
  return <div>{JSON.stringify(data)}</div>;
}

async function getEvents(): Promise<Event[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 78,
          organizerId: 586,
          name: "MOCKED EVENT",
          description: "TODO: fetch from API",
          slug: "mocked-event",
          startDate: "2021-03-23T16:13:08.489+01:00",
          endDate: "2021-03-23T18:13:08.489+01:00",
          firstFormId: 246,
          lat: 41.705,
          long: -87.475,
          primaryColor: "#ffffff",
          organizer: "Lorem Ipsum",
          participantsCount: 83,
          createdAt: "2021-03-23T16:13:08.489+01:00",
          updatedAt: "2021-03-23T16:13:08.489+01:00",
          photoUrl: "Lorem Ipsum",
        },
      ]);
    }, 300);
  });
}
