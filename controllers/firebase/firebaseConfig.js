require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Replace with your service account key file path

// firebase.js
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

const firebaseConfig = {
    credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET, // Replace with your Firebase storage bucket
};

const firebaseApp = initializeApp(firebaseConfig);

const bucket = getStorage().bucket();

module.exports = { bucket };

