import { Typography } from "@/components";
import { CreateNewEventForm } from "@/modules/createNewEventForm/CreateNewEventForm";
import { readAllValidEventDbEntries } from "@/utils/firestoreUtils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();

  const [safeEvents, setSafeEvents] = useState<
    Awaited<ReturnType<typeof readAllValidEventDbEntries>> | { success?: undefined }
  >({});

  useEffect(() => {
    (async () => {
      const l = await readAllValidEventDbEntries();
      setSafeEvents(l);
    })();
  }, []);
  return (
    <Typography>
      <h2>Events</h2>
      <p>
        Welcome to your events page. Here you can start a new event or view an event that you have
        previously created which allows you to view previous photos or continue taking photos for
        that event.
      </p>

      <CreateNewEventForm onCreateEventSuccess={(x) => router.push(`/event/${x.id}/capture`)} />

      {safeEvents.success && (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th># </th>
                <th className="w-56">Name</th>
                <th>Created At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {safeEvents.data.map((event, j) => (
                <tr key={event.id}>
                  <th>{j + 1}</th>
                  <td>{event.name}</td>
                  <td>{event.createdAt}</td>
                  <td className="text-right">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => router.push(`/${event.id}/manage`)}
                    >
                      View Event &gt;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Typography>
  );
}
