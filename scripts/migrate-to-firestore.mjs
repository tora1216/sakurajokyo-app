import { readFileSync } from 'fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const firestore = getFirestore(app)
const db = JSON.parse(readFileSync('data/db.json', 'utf-8'))

await firestore.collection('app-data').doc('db').set(db)

console.log(`移行完了: salesReps ${db.salesReps.length}件, records ${db.records.length}件`)
