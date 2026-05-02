// ============================================
//  Scholar Tripura — Firebase Configuration
//  Replace with your actual Firebase project config
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Firebase Storage removed — using Cloudinary (free) for image uploads instead
// See uploadToCloudinary() in script.js

// ── Firestore Security Rules ─────────────────────────────────
// Paste these in Firebase Console → Firestore → Rules tab:
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /books/{id} {
//       allow read: if true;
//       allow write: if request.auth != null;  // admin only
//     }
//     match /enlist_requests/{id} {
//       allow create: if true;                 // anyone can submit
//       allow read, update, delete: if request.auth != null; // admin only
//     }
//   }
// }
//
// ── Firebase Storage Rules ────────────────────────────────────
// rules_version = '2';
// service firebase.storage {
//   match /b/{bucket}/o {
//     match /book_images/{fileName} {
//       allow read: if true;
//       allow write: if request.resource.size < 2 * 1024 * 1024
//                    && request.resource.contentType.matches('image/.*');
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
const db   = getFirestore(app);
// No Firebase Storage — images handled by Cloudinary (free tier)

// ── Auth Helpers ─────────────────────────────────────────────
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

// ── Book CRUD ─────────────────────────────────────────────────

/** Fetch all approved books from Firestore */
export async function getBooks(filters = {}) {
  let q = collection(db, "books");
  const constraints = [where("approved", "==", true)];

  if (filters.category && filters.category !== "all") {
    constraints.push(where("category", "==", filters.category));
  }
  if (filters.condition && filters.condition !== "all") {
    constraints.push(where("condition", "==", filters.condition));
  }

  constraints.push(orderBy("createdAt", "desc"));
  q = query(q, ...constraints);

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Fetch a single book by ID */
export async function getBookById(id) {
  const snap = await getDoc(doc(db, "books", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Add a new book (admin) */
export async function addBook(bookData) {
  return addDoc(collection(db, "books"), {
    ...bookData,
    approved: true,
    sold: false,
    createdAt: serverTimestamp()
  });
}

/** Update a book */
export async function updateBook(id, data) {
  return updateDoc(doc(db, "books", id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/** Delete a book */
export async function deleteBook(id) {
  return deleteDoc(doc(db, "books", id));
}

// ── Enlist Requests ──────────────────────────────────────────

/** Submit an enlist request (user) */
export async function submitEnlistRequest(data) {
  return addDoc(collection(db, "enlist_requests"), {
    ...data,
    approved: false,
    createdAt: serverTimestamp()
  });
}

/** Get all pending enlist requests (admin) */
export async function getEnlistRequests(approvedFilter = false) {
  const q = query(
    collection(db, "enlist_requests"),
    where("approved", "==", approvedFilter),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Approve an enlist request — copies data into books collection, marks request approved */
export async function approveEnlistRequest(requestId) {
  const reqDoc = await getDoc(doc(db, "enlist_requests", requestId));
  if (!reqDoc.exists()) throw new Error("Request not found");

  const data = reqDoc.data();

  // Add to books
  await addBook({
    title:        data.bookName,
    author:       data.author,
    category:     data.subject,
    condition:    data.condition,
    buyPrice:     data.sellingPrice,
    rentPrice:    data.rentingPrice || null,
    images:       data.images || [],
    phone:        data.phone,
    address:      data.address,
    pubDate:      data.pubDate,
    description:  ""
  });

  // Mark request approved
  await updateDoc(doc(db, "enlist_requests", requestId), {
    approved: true,
    approvedAt: serverTimestamp()
  });
}

/** Reject / delete an enlist request */
export async function rejectEnlistRequest(id) {
  return deleteDoc(doc(db, "enlist_requests", id));
}

// ── Image Upload ─────────────────────────────────────────────
// Handled by Cloudinary — see uploadToCloudinary() in script.js
// Free tier: 25GB storage + 25GB bandwidth/month

// ── Export Firestore primitives for direct use ───────────────
export { db, auth, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy };
