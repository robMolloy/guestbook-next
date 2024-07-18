import {
  QueryFieldFilterConstraint,
  and,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { z } from "zod";

import { db, storage } from "@/config/firebaseConfig";
import dayjs from "dayjs";

const collectionName = "selectedImages";
const collectionRef = collection(db, collectionName);

export const selectedImageUploadSeedSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  eventId: z.string(),
  uid: z.string(),
  imageDataUrl: z.string(),
});
export const selectedImageDbEntrySeedSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  eventId: z.string(),
  uid: z.string(),
  storagePath: z.string(),
  downloadUrl: z.string(),
});
export const selectedImageDbEntrySchema = z.object({
  id: z.string(),
  groupId: z.string(),
  eventId: z.string(),
  uid: z.string(),
  storagePath: z.string(),
  downloadUrl: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const selectedImageDetails = z.object({
  id: z.string(),
  groupId: z.string(),
  eventId: z.string(),
  uid: z.string(),
  storagePath: z.string(),
  downloadUrl: z.string(),
});

export type TSelectedImageUploadSeed = z.infer<typeof selectedImageUploadSeedSchema>;
export type TSelectedImageDbEntrySeedSchema = z.infer<typeof selectedImageDbEntrySeedSchema>;
export type TSelectedImageDbEntry = z.infer<typeof selectedImageDbEntrySchema>;
export type TSelectedImageDetails = z.infer<typeof selectedImageDetails>;

export const uploadSelectedImage = async (seed: TSelectedImageUploadSeed) => {
  try {
    const storagePath = `${collectionName}/${seed.id}`;
    const storageRef = ref(storage, storagePath);
    const storageSnapshot = await uploadString(storageRef, seed.imageDataUrl, "data_url");

    if (!storageSnapshot.metadata.fullPath)
      throw new Error(`failed to upload doc with id "${seed.id}" into storage`);

    const downloadUrl = await getDownloadURL(storageRef);

    const dbEntrySeed: TSelectedImageDbEntrySeedSchema = {
      id: seed.id,
      groupId: seed.groupId,
      eventId: seed.eventId,
      uid: seed.uid,
      downloadUrl,
      storagePath,
    };
    const dbEntry = {
      ...dbEntrySeed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, collectionName, seed.id), dbEntry); // returns undefined
  } catch (e) {
    const error = e as ErrorEvent;
    console.error(error);
    return { success: false, error: { message: error.message } } as const;
  }
  return { success: true, data: seed } as const;
};

export const readSelectedImageDbEntry = async (id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists())
    return { success: false, error: { message: `doc with id "${id}" not found` } } as const;

  return selectedImageDbEntrySeedSchema.safeParse({ id, ...docSnap.data() });
};

export const readAllValidSelectedImageDbEntries = async (p: {
  ignoreErrors?: boolean;
  orderKey?: keyof TSelectedImageDbEntrySeedSchema;
  orderDirection?: "desc" | "asc";
  eventId?: string;
  uid: string;
}) => {
  const ignoreErrors = p?.ignoreErrors ?? true;
  const orderKey = p?.orderKey ?? "createdAt";
  const orderDirection = p?.orderDirection ?? "desc";
  const wheres: QueryFieldFilterConstraint[] = [];
  if (p?.eventId) wheres.push(where("eventId", "==", p.eventId));
  wheres.push(where("uid", "==", p.uid));

  try {
    const querySnapshot = await getDocs(query(collectionRef, and(...wheres)));

    const items: TSelectedImageDbEntry[] = [];
    querySnapshot.forEach((doc) => {
      const initData = doc.data();

      const data = {
        ...initData,
        createdAt: (() => {
          const date = dayjs(initData?.createdAt?.toMillis());
          const rtn = !!date ? date.format("D MMM YYYY HH:mm") : undefined;
          return rtn;
        })(),
        updatedAt: (() => {
          const date = dayjs(initData?.createdAt?.toMillis());
          const rtn = !!date ? date.format("D MMM YYYY HH:mm") : undefined;
          return rtn;
        })(),
      };
      console.log(`selectedImagesFirestoreUtils.ts:${/*LL*/ 84}`, { data });
      const parseResponse = selectedImageDbEntrySchema.safeParse(data);
      if (parseResponse.success) items.push(parseResponse.data);
      else {
        console.log({ parseResponse });
        const json = JSON.stringify(data);
        const errorMessage = `an item did not have the correct data structure: ${json}`;
        if (!ignoreErrors) throw new Error(errorMessage);
        console.error(errorMessage);
      }
    });

    const orderedItems = items.sort((a, b) => {
      const multiplier = orderDirection === "asc" ? 1 : -1;
      return a[orderKey] > b[orderKey] ? multiplier * 1 : multiplier * -1;
    });

    return { success: true, data: orderedItems } as const;
  } catch (e) {
    const error = e as ErrorEvent;
    console.error(error);
    return { success: false, error } as const;
  }
};

export const deleteSelectedImageDbEntry = async (p: { id: string; uid: string }) => {
  await deleteDoc(doc(db, collectionName, p.id));
  return { success: true, data: undefined } as const;
};
export const deleteAllValidSelectedImageDbEntries = async (
  p: Parameters<typeof readAllValidSelectedImageDbEntries>[0],
) => {
  const response = await readAllValidSelectedImageDbEntries(p);
  if (!response.success) return response;

  for (const item of response.data) {
    await deleteSelectedImageDbEntry({ id: item.id, uid: p.uid });
  }
  return readAllValidSelectedImageDbEntries(p);
};

export const uploadSelectedImageAndConfirm = async (item: TSelectedImageUploadSeed) => {
  const createResponse = await uploadSelectedImage(item);

  if (!createResponse.success) return createResponse;

  return readSelectedImageDbEntry(item.id);
};

export const getSelectedImageDetails = async (id: string) => {
  try {
    const selectedImageDbEntryResponse = await readSelectedImageDbEntry(id);
    if (!selectedImageDbEntryResponse.success) return selectedImageDbEntryResponse;

    const storagePath = `${collectionName}/${id}`;
    const downloadUrl = await getDownloadURL(ref(storage, storagePath));
    if (!downloadUrl) throw new Error(`no data found when searching id "${id}" in storage`);

    const data: TSelectedImageDetails = {
      id,
      groupId: selectedImageDbEntryResponse.data.groupId,
      eventId: selectedImageDbEntryResponse.data.eventId,
      uid: selectedImageDbEntryResponse.data.uid,
      storagePath,
      downloadUrl,
    };
    return { success: true, data } as const;
  } catch (e) {
    const error = e as ErrorEvent;
    return { success: false, error: { message: error.message } } as const;
  }
};
