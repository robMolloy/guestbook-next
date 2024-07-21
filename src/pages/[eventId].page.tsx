import { Typography } from "@/components";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  TSelectedImageDbEntry,
  deleteSelectedImageDbEntry,
  watchValidSelectedImageDbEntries,
} from "@/utils/firestoreUtils";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const DisplaySelectedImageModal = (p: {
  selectedImage: TSelectedImageDbEntry;
  onDelete: (x: TSelectedImageDbEntry) => void;
}) => {
  const x = p.selectedImage;
  const modalId = `modal-delete-${x.id}`;
  return (
    <div tabIndex={0} className="collapse bg-neutral shadow-lg">
      <input type="checkbox" />
      <div className="collapse-title min-h-0 p-2 text-xl font-medium">
        {convertFirestoreTimestampToFormattedDateString(x.createdAt)}
      </div>
      {
        <div className="collapse-content pt-0">
          <img src={x.downloadUrl} className="m-0" />
          <br />
          <button
            className="btn btn-info"
            onClick={() => {
              const deleteModal = document.getElementById(modalId) as HTMLDialogElement | undefined;
              deleteModal?.showModal();
            }}
          >
            Delete
          </button>
          <dialog id={modalId} className="modal">
            <div className="modal-box">
              <p className="py-4">Are you sure you want to delete this image?</p>
              <form method="dialog" className="flex gap-4">
                <button className="btn btn-error" onClick={async () => p.onDelete(x)}>
                  Yes
                </button>
                <button className="btn btn-outline">Cancel</button>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      }
    </div>
  );
};

const convertFirestoreTimestampToFormattedDateString = (x: { seconds: number }) => {
  const date = dayjs(x.seconds * 1000);
  return !!date ? date.format("D MMM YYYY HH:mm") : undefined;
};

export default function Page() {
  const router = useRouter();
  const eventId = router.query.eventId as string;
  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();
  const [selectedImages, setSelectedImages] = useState<TSelectedImageDbEntry[]>([]);
  const [deletedSelectedImageIds, setDeletedSelectedImageIds] = useState<string[]>([]);

  useEffect(() => {
    if (safeAuthStore.status !== "logged_in") return;

    const unsub = watchValidSelectedImageDbEntries({
      uid: safeAuthStore.user.uid,
      eventId,
      onNewSnapshot: (docs) => {
        setSelectedImages(docs);
      },
      onAddedDoc: (doc) => {
        const options = { method: "POST", body: JSON.stringify(doc) };
        fetch("http://localhost:3000/api/print-image", options);
      },
    });
    return () => unsub();
  }, []);

  return (
    <Typography fullPage>
      <h2>Manage Event</h2>
      <p>
        This page allows you to manage any open events. View any photos or continue with your event
        by clicking the button below.
      </p>
      <div className="flex justify-center">
        <button className="btn btn-primary" onClick={() => router.push(`/${eventId}/capture`)}>
          Continue
        </button>
      </div>
      <br />
      <div className="flex flex-col gap-4">
        {selectedImages.map((x) => {
          return (
            <React.Fragment key={x.id}>
              <DisplaySelectedImageModal
                selectedImage={x}
                onDelete={async (x) => {
                  if (safeAuthStore.status !== "logged_in") return;
                  const deleteResponse = await deleteSelectedImageDbEntry({
                    id: x.id,
                    uid: safeAuthStore.user.uid,
                  });
                  if (!deleteResponse.success) return;
                  setDeletedSelectedImageIds([...deletedSelectedImageIds, x.id]);
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </Typography>
  );
}
