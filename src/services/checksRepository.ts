import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { CheckItem } from '../types';

const COLLECTION = 'checks';

// Ensure collection exists by checking if it has any documents
async function ensureCollectionExists() {
  try {
    const collectionRef = collection(db, COLLECTION);
    const snapshot = await getDocs(collectionRef);
    // Collection exists if we can query it (even if empty)
    return true;
  } catch (error) {
    console.log('Collection does not exist, will be created on first write');
    return false;
  }
}

export function subscribeChecks(
  onChange: (checks: CheckItem[]) => void,
  onError?: (e: unknown) => void,
) {
  // Ensure collection exists before subscribing
  ensureCollectionExists().catch(console.error);

  const q = query(collection(db, COLLECTION), orderBy('dueDate', 'asc'));
  return onSnapshot(
    q,
    snap => {
      const items: CheckItem[] = snap.docs.map(d => ({
        id: d.id,
        // Ensure backwards compatibility if currency missing in Firestore (should not happen with new code)
        currency: (d.data() as any).currency || 'USD',
        ...(d.data() as Omit<CheckItem, 'id' | 'currency'>),
      }));
      onChange(items);
    },
    err => {
      console.error('Firestore subscription error:', err);
      onError && onError(err);
    },
  );
}

export async function createCheck(
  item: Omit<CheckItem, 'id'>,
): Promise<string> {
  // Ensure collection exists before creating document
  await ensureCollectionExists();

  // enforce currency on create
  const ref = await addDoc(collection(db, COLLECTION), {
    ...item,
    currency: item.currency || 'USD',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function setNotificationIds(
  id: string,
  notificationIdCsv: string | null,
) {
  // Ensure collection exists before updating
  await ensureCollectionExists();
  await updateDoc(doc(db, COLLECTION, id), {
    notificationId: notificationIdCsv,
    updatedAt: serverTimestamp(),
  });
}

export async function updateCheck(
  id: string,
  updates: Partial<Omit<CheckItem, 'id'>>,
) {
  // Ensure collection exists before updating
  await ensureCollectionExists();
  await updateDoc(doc(db, COLLECTION, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCheckById(id: string) {
  // Ensure collection exists before deleting
  await ensureCollectionExists();

  // Fetch the check data
  const checkRef = doc(db, COLLECTION, id);
  const checkSnap = await getDoc(checkRef);
  if (checkSnap.exists()) {
    const removedCheck = {
      ...checkSnap.data(),
      removedAt: serverTimestamp(),
      originalId: id,
    };
    // Save to removed_checks collection
    await addDoc(collection(db, 'removed_checks'), removedCheck);
  }

  // Delete the original check
  await deleteDoc(checkRef);
}

export async function scheduleCheckReminders(
  id: string,
  dueDate: string,
  title: string,
  priority: string
): Promise<string | null> {
  if (!('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    action: 'scheduleNotification',
    data: {
      id,
      title,
      body: `Check "${title}" is due soon (${priority})`,
      dueDate,
      priority,
    },
  });

  return `notif-${id}`;
}