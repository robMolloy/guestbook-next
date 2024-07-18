import { useSignal } from "@/utils/useSignal";
import { useState } from "react";
import { v4 as uuid } from "uuid";

type TFlowStatus = "ready" | "capturing" | "selecting" | "sending" | "fail" | "success";

export const useFlow = () => {
  const [selectableImageDataUrls, setSelectableImageDataUrls] = useState<string[]>([]);
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<TFlowStatus>("ready");
  const [groupId, setGroupId] = useState<string>(uuid());

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

  const reset = () => {
    setStatus("ready");
    setSelectableImageDataUrls([]);
    setSelectedImageDataUrl(undefined);
    setGroupId(uuid());
  };

  return {
    status,
    setStatus,
    groupId,
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
