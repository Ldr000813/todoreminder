import * as admin from 'firebase-admin';

// Initialize Firebase Admin lazily
function initFirebase() {
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

// Create a proxy so that `db.collection()` calls initFirebase on the fly
export const db = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop) {
    initFirebase();
    if (!admin.apps.length) {
      console.warn("Firebase Admin is not initialized. Check your environment variables.");
      // Return a dummy object with dummy methods to prevent crash on build
      return () => ({
        where: () => ({ get: async () => ({ docs: [], empty: true }) }),
        doc: () => ({ update: async () => {}, delete: async () => {} }),
        add: async () => ({ id: "dummy-id" }),
      });
    }
    const firestore = admin.firestore();
    return (firestore as any)[prop];
  }
});

export const auth = new Proxy({} as admin.auth.Auth, {
  get(target, prop) {
    initFirebase();
    if (!admin.apps.length) {
      return () => {}; // Dummy implementation
    }
    const authInstance = admin.auth();
    return (authInstance as any)[prop];
  }
});
