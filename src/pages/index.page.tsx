import { Button } from "@/components";
import { Flash } from "@/modules";
import { useFlow } from "@/modules/cycleFlow/useFlow";
import { DumbVideoStream } from "@/modules/videoStream";
import {
  VideoStreamContainer,
  VideoStreamContainerItem,
} from "@/modules/videoStream/VideoStreamContainer";

const delay = async (x: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), x);
  });
};

const Parent = () => {
  const {
    status,
    setStatus,
    imageDataUrls,
    addImageDataUrl,
    selectedImageDataUrl,
    setSelectedImageDataUrl,
    flashSignal,
    captureSignal,
    capture,
    reset,
  } = useFlow();

  return (
    <main
      className={`h-screen flex flex-col`}
      onClick={async () => {
        if (status !== "ready") return;
        setStatus("capturing");

        capture();
        await delay(1000);
        capture();
        await delay(1000);
        capture();
        await delay(1000);
        capture();

        setStatus("selecting");
      }}
    >
      <br />
      <div className="flex-1">
        <div className="prose w-full m-auto">
          <h2 className="text-center">
            {status === "ready" && "Tap anywhere to begin"}
            {status === "capturing" && "Pose for 4 photos"}
            {status === "selecting" && "Select photo or discard"}
            {status === "sending" && "Please wait..."}
            {status === "fail" && "Something has gone wrong, please try again"}
            {status === "success" && "Success! Please return the device"}
            {`: `}
            {status}
          </h2>
        </div>
        <br />

        <div className="flex justify-center items-center">
          <VideoStreamContainer>
            {(status === "ready" ||
              status === "capturing" ||
              status === "selecting") && (
              <VideoStreamContainerItem>
                <Flash signal={flashSignal} />
              </VideoStreamContainerItem>
            )}
            {(status === "ready" ||
              status === "capturing" ||
              status === "selecting") && (
              <VideoStreamContainerItem>
                <DumbVideoStream
                  signal={captureSignal}
                  onCapture={(x) => addImageDataUrl(x)}
                  className={`${status === "selecting" ? "invisible" : ""}`}
                />
              </VideoStreamContainerItem>
            )}

            {(status === "selecting" ||
              status === "sending" ||
              status === "success") && (
              <VideoStreamContainerItem>
                {selectedImageDataUrl ? (
                  <div
                    className={`flex w-full h-full`}
                    style={{
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundImage: `url('${selectedImageDataUrl}`,
                    }}
                  />
                ) : (
                  <div className="flex flex-1 justify-center items-center text-lg bg-base-300">
                    Select your favourite image
                  </div>
                )}
              </VideoStreamContainerItem>
            )}
            {status === "sending" && (
              <VideoStreamContainerItem>
                <div
                  className={`flex w-full h-full justify-center items-center bg-gray-400 opacity-60`}
                >
                  <span className="loading loading-spinner loading-lg" />
                </div>
              </VideoStreamContainerItem>
            )}
            {status === "fail" && (
              <VideoStreamContainerItem>
                <div className="flex justify-center w-full h-full items-center">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="error"
                      onClick={() => setStatus("selecting")}
                    >
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
      <div className="">
        {status === "selecting" && (
          <div className="flex justify-center gap-2">
            <Button
              variant="primary"
              disabled={!selectedImageDataUrl}
              onClick={async () => {
                if (!selectedImageDataUrl) return;
                setStatus("sending");
                await delay(1000);
                setStatus(Math.random() < 0.8 ? "success" : "fail");
              }}
            >
              Select
            </Button>
            <Button
              variant="ghost"
              outline
              onClick={() => {
                reset();
              }}
            >
              Discard
            </Button>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col justify-center items-center">
            <Button variant="ghost" outline onClick={async () => reset()}>
              Start again
            </Button>
          </div>
        )}
      </div>
      <br />
      <div className="flex-1">
        {(status === "capturing" || status === "selecting") && (
          <div className="grid h-full gap-5 grid-cols-2 mx-4">
            {[0, 1, 2, 3].map((j) => (
              <div
                key={`display-image-${j}`}
                className="border border-white w-full indicator"
              >
                <span className="indicator-item badge badge-secondary h-6 w-6">
                  {j + 1}
                </span>
                <div
                  onClick={() => {
                    if (status === "selecting")
                      setSelectedImageDataUrl(imageDataUrls[j]);
                  }}
                  className="bg-base-300 w-full"
                  style={{
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url('${imageDataUrls[j]}`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <br />
    </main>
  );
};

export default Parent;
