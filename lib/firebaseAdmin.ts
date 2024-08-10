import admin from 'firebase-admin';
import adminKey from './adminKey.json'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: adminKey.project_id,
      clientEmail: adminKey.client_email,
      privateKey: adminKey.private_key.replace(/\\n/g, '\n'),
    }),
    projectId: adminKey.project_id,
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
