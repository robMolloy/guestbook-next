import { useSignal } from "@/utils/useSignal";
import { useState } from "react";

type TFlowStatus = "ready" | "capturing" | "selecting" | "sending" | "fail" | "success";

export const useFlow = () => {
  const [selectableImageDataUrls, setSelectableImageDataUrls] = useState<string[]>([]);
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | undefined>();

  const addSelectableImageDataUrl = (imageDataUrl: string) => {
    if (selectableImageDataUrls.length >= 4) return;
    setSelectableImageDataUrls([...selectableImageDataUrls, imageDataUrl]);
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
    setSelectableImageDataUrls([]);
    setSelectedImageDataUrl(undefined);
  };

  return {
    status,
    setStatus,
    selectableImageDataUrls,
    setSelectableImageDataUrls,
    addSelectableImageDataUrl,
    selectedImageDataUrl,
    setSelectedImageDataUrl,
    flashSignal,
    captureSignal,
    capture,
    reset,
  };
};
