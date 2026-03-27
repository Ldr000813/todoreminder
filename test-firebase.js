const { loadEnvConfig } = require('@next/env');
const admin = require('firebase-admin');

loadEnvConfig(process.cwd());

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
}
console.log("Firebase App Name:", admin.app().name);

const db = admin.firestore();
db.collection('tasks').limit(1).get()
  .then(snapshot => console.log('Successfully queried tasks, empty:', snapshot.empty))
  .catch(err => console.error('Firestore Error:', err.message));
