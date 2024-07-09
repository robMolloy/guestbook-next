import { useSignal } from "@/utils/useSignal";
import { useState } from "react";

type TFlowStatus =
  | "ready"
  | "capturing"
  | "selecting"
  | "sending"
  | "fail"
  | "success";

export const useFlow = () => {
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);

  const addImageDataUrl = (imageDataUrl: string) => {
    if (imageDataUrls.length >= 4) return;
    setImageDataUrls([...imageDataUrls, imageDataUrl]);
  };

  const flashSignal = useSignal();
  const captureSignal = useSignal();

  const capture = () => {
    flashSignal.changeSignal();
    captureSignal.changeSignal();
  };

  const [status, setStatus] = useState<TFlowStatus>("ready");

  const reset = () => {
    setStatus("ready");
    setImageDataUrls([]);
  };

  return {
    status,
    setStatus,
    imageDataUrls,
    setImageDataUrls,
    addImageDataUrl,
    flashSignal,
    captureSignal,
    capture,
    reset,
  };
};
