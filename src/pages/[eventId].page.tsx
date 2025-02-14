import { Typography } from "@/components";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  TSelectedImageDbEntry,
  deleteSelectedImageDbEntry,
  watchValidSelectedImageDbEntries,
} from "@/utils/firestoreUtils";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

const printImage = (doc: TSelectedImageDbEntry) => {
  const options = { method: "POST", body: JSON.stringify(doc) };
  fetch("http://localhost:3000/api/print-image", options);
};

const useModalControls = () => {
  const [modalId] = useState(uuid());
  const showModal = () => {
    const modalElm = document.getElementById(modalId) as HTMLDialogElement | undefined;
    modalElm?.showModal();
  };
  return { showModal, modalId };
};

const Modal = (p: { modalId: string; children: React.ReactNode }) => {
  return (
    <dialog id={p.modalId} className="modal">
      <div className="modal-box">{p.children}</div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

const DisplaySelectedImageModal = (p: {
  showPrintButton: boolean;
  selectedImage: TSelectedImageDbEntry;
  onDelete: (x: TSelectedImageDbEntry) => void;
  onPrint: (x: TSelectedImageDbEntry) => void;
}) => {
  const x = p.selectedImage;

  const deleteModalControls = useModalControls();
  const printModalControls = useModalControls();
  return (
    <div tabIndex={0} className="collapse bg-neutral shadow-lg">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">
        {convertFirestoreTimestampToFormattedDateString(x.createdAt)}
      </div>
      {
        <div className="collapse-content pt-0">
          <div className="flex justify-center">
            <img src={x.downloadUrl} className="m-0" />
          </div>
          <br />
          <div className="flex gap-4">
            {p.showPrintButton && (
              <button className="btn btn-outline" onClick={() => printModalControls.showModal()}>
                Print
              </button>
            )}
            <button className="btn btn-error" onClick={() => deleteModalControls.showModal()}>
              Delete
            </button>
          </div>
          <Modal modalId={deleteModalControls.modalId}>
            <p className="py-4">Are you sure you want to delete this image?</p>
            <form method="dialog" className="flex gap-4">
              <button className="btn btn-error" onClick={async () => p.onDelete(x)}>
                Yes
              </button>
              <button className="btn btn-outline">Cancel</button>
            </form>
          </Modal>
          <Modal modalId={printModalControls.modalId}>
            <p className="py-4">Are you sure you want to print this image?</p>
            <form method="dialog" className="flex gap-4">
              <button className="btn btn-error" onClick={async () => p.onPrint(x)}>
                Yes
              </button>
              <button className="btn btn-outline">Cancel</button>
            </form>
          </Modal>
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

  const [isManualPrintingEnabled, setIsManualPrintingEnabled] = useState(false);
  // use useRef instead of useState to fix stale-state-useEffect issue
  const isPrintImagesRef = useRef(false);

  useEffect(() => {
    if (safeAuthStore.status !== "logged_in") return;

    const unsub = watchValidSelectedImageDbEntries({
      uid: safeAuthStore.user.uid,
      eventId,
      onNewSnapshot: (docs) => {
        setSelectedImages(docs);
      },
      onAddedDoc: (doc: TSelectedImageDbEntry) => {
        if (isPrintImagesRef.current) printImage(doc);
      },
    });
    return () => unsub();
  }, []);

  return (
    <Typography fullPage>
      <h2>Manage Event</h2>

      <p>
        {`This page allows you to manage any open events. View any photos or continue with your event by clicking the button below.`}
      </p>
      <div className="flex justify-center">
        <button className="btn btn-primary" onClick={() => router.push(`/${eventId}/capture`)}>
          Continue
        </button>
      </div>
      <br />
      <div className="flex justify-center">
        <div className="w-64">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Enable manual printing?</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={isManualPrintingEnabled}
                onClick={() => setIsManualPrintingEnabled((p) => !p)}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Print added images?</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={isPrintImagesRef.current}
                onClick={() => (isPrintImagesRef.current = !isPrintImagesRef.current)}
              />
            </label>
          </div>
        </div>
      </div>
      <br />
      <div className="flex flex-col gap-4">
        {selectedImages.map((x) => {
          return (
            <React.Fragment key={x.id}>
              <DisplaySelectedImageModal
                showPrintButton={isManualPrintingEnabled}
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
                onPrint={async (x) => printImage(x)}
              />
            </React.Fragment>
          );
        })}
      </div>
    </Typography>
  );
}
