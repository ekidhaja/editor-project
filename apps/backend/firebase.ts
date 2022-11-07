import admin from 'firebase-admin'

// Replace this file with your service account key you get when setting up a firestore.
import serviceAccount from './serviceAccountKey.json'

admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json"),
  databaseURL: "https://editor-project99261.firebaseio.com"
})

export default admin.firestore()
