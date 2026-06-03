import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// Handle newlines in the private key if present as escaped \n in the env var
const privateKey = rawPrivateKey
  ? rawPrivateKey.replace(/\\n/g, '\n').replace(/"/g, '')
  : undefined;

const isValidKey = privateKey && 
  privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
  !privateKey.includes('YOUR_PRIVATE_KEY_HERE');

if (!admin.apps.length) {
  if (projectId && clientEmail && isValidKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Fallback to avoid build-time crashes when real environment variables are absent/placeholders
    try {
      admin.initializeApp();
    } catch (error) {
      console.warn('Firebase Admin initialized in fallback/mock mode due to missing or invalid credentials.');
      admin.initializeApp({
        projectId: projectId || 'voxion-ads',
      });
    }
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
