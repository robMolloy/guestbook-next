import { Typography } from "@/components";
import { CreateNewEventForm } from "@/modules/createNewEventForm/CreateNewEventForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { TEventDbEntry, readAllValidEventDbEntries } from "@/utils/firestoreUtils";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const DisplayEventsTable = (p: { data: TEventDbEntry[]; eventPageUrlPrefix: string }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th className="pl-0">#</th>
          <th className="w-56">Name</th>
          <th>Created At</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {p.data.map((event, j) => (
          <tr key={event.id}>
            <th className="pl-0">{j + 1}</th>
            <td>{event.name}</td>
            <td>{event.createdAt}</td>
            <td className="pr-0 text-right">
              <Link className="btn btn-primary btn-sm" href={`${p.eventPageUrlPrefix}${event.id}`}>
                View Event &gt;
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function Page() {
  const router = useRouter();
  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();

  const [safeEvents, setSafeEvents] = useState<
    Awaited<ReturnType<typeof readAllValidEventDbEntries>> | { success?: undefined }
  >({});

  useEffect(() => {
    (async () => {
      if (safeAuthStore.status === "logged_in")
        setSafeEvents(await readAllValidEventDbEntries({ uid: safeAuthStore.user.uid }));
    })();
  }, []);
  return (
    <Typography fullPage>
      <h2>Events</h2>
      <p>
        Welcome to your events page. Here you can start a new event or view an event that you have
        previously created which allows you to view previous photos or continue taking photos for
        that event.
      </p>

      <CreateNewEventForm onCreateEventSuccess={(x) => router.push(`/${x.id}/capture`)} />

      {safeEvents.success && <DisplayEventsTable data={safeEvents.data} eventPageUrlPrefix="/" />}
    </Typography>
  );
}
