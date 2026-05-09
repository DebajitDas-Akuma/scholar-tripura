// ============================================
//  Scholar Tripura — Firebase Configuration
//  Project: scholar-tripura
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  initializeFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firestore Security Rules ─────────────────────────────────
// Go to Firebase Console → Firestore → Rules → paste → Publish:
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /books/{id} {
//       allow read: if true;
//       allow write: if request.auth != null;
//     }
//     match /enlist_requests/{id} {
//       allow create: if true;
//       allow read, update, delete: if request.auth != null;
//     }
//   }
// }

// ── Firebase Config ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyB4SgYlT2AKghLLblRSjp2tIa0bqmc84YA",
  authDomain:        "scholartripura.firebaseapp.com",
  projectId:         "scholartripura",
  storageBucket:     "scholartripura.firebasestorage.app",
  messagingSenderId: "152248757277",
  appId:             "1:152248757277:web:409bda68d1fabdc9a16af4",
  measurementId:     "G-2Z7D0SB62F"
};

// ── Init ─────────────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Force HTTP long-polling — avoids WebSocket issues on Cloudflare
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// ── Auth ──────────────────────────────────────────────────────
export async function adminLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function adminLogout() {
  return signOut(auth);
}
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
export function getCurrentUser() {
  return auth.currentUser;
}

// ── Books ─────────────────────────────────────────────────────
export async function getBooks(filters = {}) {
  const constraints = [where("approved", "==", true)];

  if (filters.category && filters.category !== "all") {
    constraints.push(where("category", "==", filters.category));
  }
  if (filters.condition && filters.condition !== "all") {
    constraints.push(where("condition", "==", filters.condition));
  }

  constraints.push(orderBy("createdAt", "desc"));
  const snap = await getDocs(query(collection(db, "books"), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getBookById(id) {
  const snap = await getDoc(doc(db, "books", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addBook(bookData) {
  return addDoc(collection(db, "books"), {
    ...bookData,
    approved:  true,
    sold:      false,
    createdAt: new Date().toISOString()
  });
}

export async function updateBook(id, data) {
  return updateDoc(doc(db, "books", id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteBook(id) {
  return deleteDoc(doc(db, "books", id));
}

// ── Enlist Requests ───────────────────────────────────────────

// submitEnlistRequest — uses SDK with 15s timeout
export async function submitEnlistRequest(data) {
  const payload = {
    ...data,
    approved:  false,
    createdAt: new Date().toISOString()
  };

  // Race between Firestore write and 15 second timeout
  const writePromise = addDoc(collection(db, "enlist_requests"), payload);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Firestore timeout — saved to Sheets instead")), 15000)
  );

  return Promise.race([writePromise, timeoutPromise]);
}

// Admin reads enlist requests via SDK (admin is authenticated, no timeout issue)
export async function getEnlistRequests(approvedFilter = false) {
  const snap = await getDocs(query(
    collection(db, "enlist_requests"),
    where("approved", "==", approvedFilter),
    orderBy("createdAt", "desc")
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function approveEnlistRequest(requestId) {
  const reqDoc = await getDoc(doc(db, "enlist_requests", requestId));
  if (!reqDoc.exists()) throw new Error("Request not found");
  const data = reqDoc.data();

  await addBook({
    title:       data.bookName,
    author:      data.author,
    category:    data.subject,
    condition:   data.condition,
    buyPrice:    data.sellingPrice,
    rentPrice:   data.rentingPrice || null,
    images:      data.images || [],
    phone:       data.phone,
    address:     data.address,
    pubDate:     data.pubDate,
    description: data.description || ""
  });

  await updateDoc(doc(db, "enlist_requests", requestId), {
    approved:   true,
    approvedAt: new Date().toISOString()
  });
}

export async function rejectEnlistRequest(id) {
  return deleteDoc(doc(db, "enlist_requests", id));
}

// ── Export primitives for admin direct use ────────────────────
export {
  db, auth,
  collection, doc,
  getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy
};
