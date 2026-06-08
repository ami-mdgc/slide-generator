import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from './firebase';

export interface PresenceData {
  sessionId: string;
  name: string;
  projectId: string | null;
  updatedAt: string;
}

export function getSessionId(): string {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    localStorage.setItem('sessionId', id);
  }
  return id;
}

export function getUserName(): string | null {
  return localStorage.getItem('userName');
}

export function saveUserName(name: string) {
  localStorage.setItem('userName', name);
}

export async function updatePresence(sessionId: string, name: string, projectId: string | null) {
  await setDoc(doc(db, 'presence', sessionId), {
    sessionId,
    name,
    projectId,
    updatedAt: new Date().toISOString(),
  });
}

export async function clearPresence(sessionId: string) {
  await deleteDoc(doc(db, 'presence', sessionId));
}

export function subscribeToPresence(callback: (presence: PresenceData[]) => void) {
  return onSnapshot(collection(db, 'presence'), (snap) => {
    const now = Date.now();
    const active = snap.docs
      .map(d => d.data() as PresenceData)
      .filter(p => now - new Date(p.updatedAt).getTime() < 2 * 60 * 1000);
    callback(active);
  });
}
