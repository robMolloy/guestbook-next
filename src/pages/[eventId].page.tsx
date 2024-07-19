import { Typography } from "@/components";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  deleteSelectedImageDbEntry,
  readAllValidSelectedImageDbEntries,
} from "@/utils/firestoreUtils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const eventId = router.query.eventId as string;
  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();
  const [safeSelectedImages, setSafeSelectedImages] = useState<
    Awaited<ReturnType<typeof readAllValidSelectedImageDbEntries>> | { success: undefined }
  >();
  const [deletedSelectedImageIds, setDeletedSelectedImageIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (safeAuthStore.status !== "logged_in") return;
      const selectedImagesResponse = await readAllValidSelectedImageDbEntries({
        uid: safeAuthStore.user.uid,
      });
      setSafeSelectedImages(selectedImagesResponse);
    })();
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
      {safeSelectedImages?.success && safeSelectedImages.data.length === 0 && (
        <div>No images added yet</div>
      )}
      {safeSelectedImages?.success &&
        safeSelectedImages.data.map((x) => {
          const modalId = `modal-delete-${x.id}`;
          const isDeleted = deletedSelectedImageIds.includes(x.id);
          return (
            <React.Fragment key={x.id}>
              <div tabIndex={0} className="collapse bg-neutral shadow-lg">
                <input type="checkbox" />
                <div className="collapse-title text-xl font-medium">
                  {x.createdAt} {isDeleted && "[DELETED]"}
                </div>
                {!isDeleted && (
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
                )}
              </div>
              <br />
            </React.Fragment>
          );
        })}
    </Typography>
  );
}
