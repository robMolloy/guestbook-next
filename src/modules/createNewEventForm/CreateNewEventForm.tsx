import { useAuthStore } from "@/stores/useAuthStore";
import { TEventDbEntry, createEventDbEntryAndConfirm } from "@/utils/firestoreUtils";
import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { z } from "zod";

export const CreateNewEventForm = (p: { onCreateEventSuccess: (x: TEventDbEntry) => void }) => {
  const [loading, setLoading] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventNameErrorMessage, setEventNameErrorMessage] = useState("");

  const authStore = useAuthStore();

  const checkEventNameValid = () => {
    try {
      const schema = z.string().min(7).max(20);
      const parseResponse = schema.safeParse(eventName);
      const errors = parseResponse.error?.errors ?? [];
      const errorMsgs = errors.map((x) => x.message);
      const errorMsg = errorMsgs.find((x) => !!x);

      if (!parseResponse.success) throw new Error(errorMsg ?? "Unknown error");

      setEventNameErrorMessage("");
      return { success: true } as const;
    } catch (e) {
      const error = e as { message: string };
      console.error({ error });

      setEventNameErrorMessage(error.message);
      return { success: false } as const;
    }
  };

  const onSubmit = async () => {
    const parseCheckResponse = checkEventNameValid();
    if (!parseCheckResponse.success) return;

    const safeStore = authStore.getSafeStore();
    if (safeStore.status !== "logged_in") return;
    if (loading) return;
    setLoading(true);

    await (async () => {
      const newEvent = { id: uuid(), uid: safeStore.user.uid, name: eventName };

      const createResponse = await createEventDbEntryAndConfirm(newEvent);

      if (!createResponse.success) return setFormErrorMessage(createResponse.error.message);
      p.onCreateEventSuccess(createResponse.data);
      console.log("success");
    })();

    setLoading(false);
  };
  return (
    <form>
      {formErrorMessage && (
        <div style={{ textAlign: "center" }} className="bg-error">
          {formErrorMessage}
        </div>
      )}
      <label className="form-control w-full">
        <div className="label">
          <span className={`label-text ${eventNameErrorMessage ? "bg-error" : ""}`}>
            {eventNameErrorMessage || "Type the name of your new event"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            style={{ flex: "1" }}
            placeholder="event name"
            className={`input input-bordered input-info w-full${
              !eventNameErrorMessage || "input-error"
            }`}
            onInput={(e) => {
              setEventName((e.target as HTMLInputElement).value);
              checkEventNameValid();
            }}
            value={eventName}
          />
          <span>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              Start
              {!loading && <span className="bg">&gt;</span>}
              {!!loading && <span className="loading loading-spinner loading-md"></span>}
            </button>
          </span>
        </div>
      </label>
    </form>
  );
};
