import { Typography } from "@/components";
import { db } from "@/config/firebaseConfig";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  TSelectedImageDbEntry,
  deleteSelectedImageDbEntry,
  selectedImageDbEntrySchema,
} from "@/utils/firestoreUtils";
import dayjs from "dayjs";
import { Timestamp, and, collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const convertFirestoreTimestampToFormattedDateString = (x: Timestamp) => {
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
    const collectionName = "selectedImages";
    const collectionRef = collection(db, collectionName);
    const q1 = query(
      collectionRef,
      and(where("uid", "==", safeAuthStore.user.uid), where("eventId", "==", eventId)),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q1, (snapshot) => {
      const docs = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertFirestoreTimestampToFormattedDateString(data?.createdAt),
            updatedAt: convertFirestoreTimestampToFormattedDateString(data?.updatedAt),
          };
        })
        .map((x) => selectedImageDbEntrySchema.safeParse(x))
        .map((x) => (x.success ? x.data : undefined))
        .filter((x) => !!x) as TSelectedImageDbEntry[];
      setSelectedImages(docs);

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added")
          fetch("http://localhost:3000/api/print-image", {
            method: "POST",
            body: JSON.stringify({ imageUrl: change.doc.data().downloadUrl }),
          });
      });
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
      {selectedImages.map((x) => {
        const modalId = `modal-delete-${x.id}`;

        return (
          <React.Fragment key={x.id}>
            <div tabIndex={0} className="collapse bg-neutral shadow-lg">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">{x.createdAt}</div>
              {
                <div className="collapse-content pt-0">
                  <img src={x.downloadUrl} className="m-0" />
                  <br />
                  <button
                    className="btn btn-info"
                    onClick={() => {
                      const deleteModal = document.getElementById(modalId) as
                        | HTMLDialogElement
                        | undefined;
                      deleteModal?.showModal();
                    }}
                  >
                    Delete
                  </button>
                  <dialog id={modalId} className="modal">
                    <div className="modal-box">
                      <p className="py-4">Are you sure you want to delete this image?</p>
                      <form method="dialog" className="flex gap-4">
                        <button
                          className="btn btn-error"
                          onClick={async () => {
                            if (safeAuthStore.status !== "logged_in") return;
                            const deleteResponse = await deleteSelectedImageDbEntry({
                              id: x.id,
                              uid: safeAuthStore.user.uid,
                            });

                            if (!deleteResponse.success) return;
                            setDeletedSelectedImageIds([...deletedSelectedImageIds, x.id]);
                          }}
                        >
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
            <br />
          </React.Fragment>
        );
      })}
    </Typography>
  );
}
