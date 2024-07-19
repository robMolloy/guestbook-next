import { Button } from "@/components";
import { Flash } from "@/modules";
import { useFlow } from "@/modules/cycleFlow/useFlow";
import { DumbVideoStream } from "@/modules/videoStream";
import {
  VideoStreamContainer,
  VideoStreamContainerItem,
} from "@/modules/videoStream/VideoStreamContainer";
import { useAuthStore } from "@/stores/useAuthStore";
import { uploadBackupImage, uploadSelectedImageAndConfirm } from "@/utils/firestoreUtils";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";

const delay = async (x: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), x);
  });
};

const Parent = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();
  const eventId = router.query.eventId as string;

  const {
    status,
    setStatus,
    groupId,
    selectableImageDataUrls,
    addSelectableImageDataUrl,
    selectedImageDataUrl,
    setSelectedImageDataUrl,
    flashSignal,
    captureSignal,
    capture,
    reset,
  } = useFlow();
  return (
    <>
      <main
        className={`flex h-screen flex-col`}
        onClick={async () => {
          if (status !== "ready") return;
          setStatus("capturing");

          await delay(1000);
          capture();
          await delay(1000);
          capture();
          await delay(1000);
          capture();
          await delay(1000);
          capture();
          await delay(1000);

          setStatus("selecting");
        }}
      >
        <br />
        <div className="flex-1">
          <div className="prose m-auto w-full">
            <h2 className="text-center">
              {status === "ready" && "Tap anywhere to begin"}
              {status === "capturing" && "Pose for 4 photos"}
              {status === "selecting" && "Select photo or discard"}
              {status === "sending" && "Please wait..."}
              {status === "fail" && "Something has gone wrong, please try again"}
              {status === "success" && "Success! Please return the device"}
              {`: ${status}`}
            </h2>
          </div>
          <br />

          <div className="flex items-center justify-center">
            <VideoStreamContainer>
              {(status === "ready" || status === "capturing" || status === "selecting") && (
                <VideoStreamContainerItem>
                  <Flash signal={flashSignal} />
                </VideoStreamContainerItem>
              )}
              {(status === "ready" || status === "capturing" || status === "selecting") && (
                <VideoStreamContainerItem>
                  <DumbVideoStream
                    signal={captureSignal}
                    onCapture={(x) => {
                      addSelectableImageDataUrl(x);
                      if (safeAuthStore.status === "logged_in") {
                        const newBackupImage = {
                          id: uuid(),
                          groupId,
                          eventId,
                          uid: safeAuthStore.user.uid,
                          imageDataUrl: x,
                        };

                        uploadBackupImage(newBackupImage);
                      }
                    }}
                    className={`${status === "selecting" ? "invisible" : ""}`}
                  />
                </VideoStreamContainerItem>
              )}

              {(status === "selecting" || status === "sending" || status === "success") && (
                <VideoStreamContainerItem>
                  {selectedImageDataUrl ? (
                    <div
                      className={`flex h-full w-full`}
                      style={{
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundImage: `url('${selectedImageDataUrl}`,
                      }}
                    />
                  ) : (
                    <div className="flex flex-1 items-center justify-center bg-base-300 text-lg">
                      Select your favourite image
                    </div>
                  )}
                </VideoStreamContainerItem>
              )}
              {status === "sending" && (
                <VideoStreamContainerItem>
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gray-400 opacity-60`}
                  >
                    <span className="loading loading-spinner loading-lg" />
                  </div>
                </VideoStreamContainerItem>
              )}
              {status === "fail" && (
                <VideoStreamContainerItem>
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="error" onClick={() => setStatus("selecting")}>
                        Try again
                      </Button>
                    </div>
                  </div>
                </VideoStreamContainerItem>
              )}
            </VideoStreamContainer>
          </div>
        </div>
        <br />
        <div className="flex justify-center gap-2">
          {status === "ready" && <Button variant="primary">Tap anywhere to start</Button>}
          {status === "selecting" && (
            <>
              <Button
                variant="primary"
                disabled={!selectedImageDataUrl}
                onClick={async () => {
                  if (!selectedImageDataUrl) return;

                  if (safeAuthStore.status !== "logged_in") return;
                  setStatus("sending");
                  await delay(1000);
                  const uploadResponse = await uploadSelectedImageAndConfirm({
                    id: uuid(),
                    groupId,
                    eventId,
                    uid: safeAuthStore.user.uid,
                    imageDataUrl: selectedImageDataUrl,
                  });
                  setStatus(uploadResponse.success ? "success" : "fail");
                }}
              >
                Select
              </Button>
              <Button variant="ghost" outline onClick={() => reset()}>
                Discard
              </Button>
            </>
          )}
          {status === "success" && (
            <Button variant="ghost" outline onClick={async () => reset()}>
              Start again
            </Button>
          )}
        </div>
        <br />
        <div className="flex-1">
          {(status === "capturing" || status === "selecting") && (
            <div className="mx-4 grid h-full grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((j) => (
                <div key={`display-image-${j}`} className="indicator w-full border border-white">
                  <span className="badge indicator-item badge-secondary h-6 w-6">{j + 1}</span>
                  <div
                    onClick={() => {
                      if (status === "selecting")
                        setSelectedImageDataUrl(selectableImageDataUrls[j]);
                    }}
                    className="w-full bg-base-300"
                    style={{
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundImage: `url('${selectableImageDataUrls[j]}`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <br />
      </main>
    </>
  );
};

export default Parent;
