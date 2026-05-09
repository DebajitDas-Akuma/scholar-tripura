# 📚 Scholar Tripura — Book Marketplace

Tripura's student book marketplace for buying, selling, and renting new & used books.

---

## 📁 Project Structure

```
scholar-tripura/
├── index.html          → Homepage — book listings with search & filters
├── book.html           → Individual book detail page
├── form.html           → Buy / Rent order form
├── enlist.html         → Enlist your books form
├── admin.html          → Admin dashboard (login required)
├── style.css           → All styles
├── script.js           → Shared utilities (ES module)
├── firebase.js         → Firebase configuration & helpers
├── google-apps-script.js → Paste this into Google Apps Script
└── README.md
```

---

## 🚀 Setup Guide

### Step 1 — Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** → give it a name (e.g. `scholar-tripura`)
3. Enable **Google Analytics** (optional) → Create project

#### Enable Firebase Services:

**Authentication**
- Console → Authentication → Get Started
- Enable **Email/Password** provider
- Create an admin user: Authentication → Users → Add User
  - Email: `admin@scholartripura.com` (or any)
  - Password: (strong password)

**Firestore Database**
- Console → Firestore Database → Create Database
- Choose **Production Mode** → select region (e.g. `asia-south1`)
- After creation, set **Security Rules**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for approved books
    match /books/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Anyone can submit enlist requests; only admin can read/modify
    match /enlist_requests/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

**Storage**
- Console → Storage → Get Started → Production mode
- Set Storage Rules:
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /book_images/{fileName} {
      allow read: if true;
      allow write: if request.content_type.matches('image/.*')
                   && request.resource.size < 2 * 1024 * 1024;
    }
  }
}
```

#### Get your Firebase config:
- Console → ⚙️ Project Settings → Your Apps → Add App → Web
- Copy the `firebaseConfig` object

**Paste it into `firebase.js`** replacing the placeholder values.

---

### Step 2 — Google Sheets Integration

1. Open [Google Sheets](https://sheets.google.com) → New spreadsheet
2. Name it `Scholar Tripura Orders`
3. Click **Extensions → Apps Script**
4. Delete the default code
5. Paste the entire contents of `google-apps-script.js`
6. Click **Save** (💾)
7. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy** → Authorize when prompted
9. Copy the **Web App URL**
10. Paste it into `script.js` → `CONFIG.GOOGLE_SCRIPT_URL`

---

### Step 3 — WhatsApp Alerts

1. Open `script.js`
2. Find `ADMIN_WHATSAPP: "91XXXXXXXXXX"`
3. Replace with your WhatsApp number including country code
   - Example: `"919876543210"` (91 = India, followed by 10-digit number)

**Note:** This uses the `wa.me` deep-link approach — clicking "Place Order" will open WhatsApp with the order details pre-filled. No API key required.

For automated (non-click) messages, you can use:
- [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) (free tier available)
- [Twilio WhatsApp API](https://www.twilio.com/whatsapp) (paid)

---

### Step 4 — Deploy

Since this is a pure HTML/CSS/JS site with ES modules, you need a server that supports HTTPS (Firebase modules require it).

**Option A: Firebase Hosting (Recommended)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to: . (current folder)
# Single-page app: No
# Overwrite index.html: No
firebase deploy
```

**Option B: Vercel / Netlify**
- Drag and drop the folder onto [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- Done! They auto-detect static sites.

**Option C: Local Development**
```bash
# Use a local server (not just file://)
npx serve .
# Or:
python3 -m http.server 3000
```
Open: `http://localhost:3000`

---

## 🎯 Features Summary

| Feature | Status |
|---------|--------|
| Book listing grid with cards | ✅ |
| Search & filter (category, condition) | ✅ |
| Book detail page with image gallery | ✅ |
| Buy / Rent order form | ✅ |
| Google Sheets order logging | ✅ |
| WhatsApp admin alert | ✅ |
| Enlist book form with image upload | ✅ |
| Firebase Storage for images | ✅ |
| Admin login (Firebase Auth) | ✅ |
| Admin dashboard with stats | ✅ |
| View / Edit / Delete books | ✅ |
| Approve / Reject enlist requests | ✅ |
| Add new books manually | ✅ |
| Form validation (phone, PIN, required) | ✅ |
| Mobile responsive design | ✅ |
| Available / Sold Out badge | ✅ |
| Related books section | ✅ |
| Toast notifications | ✅ |
| Loading spinners | ✅ |

---

## 📝 Notes

- The site uses **ES modules** (`type="module"`) — it must be served over HTTP/HTTPS, not opened as a local `file://` URL.
- Replace all `TODO` comments in `firebase.js` and `script.js` with your actual credentials.
- For production, consider adding Firebase's [App Check](https://firebase.google.com/docs/app-check) to prevent abuse.
- Books are stored in Firestore with an `approved: true` flag — only admin-approved books appear publicly.

---

## 🛠 Tech Stack

- **HTML / CSS / Vanilla JS** — no frameworks
- **Firebase v10** (Auth, Firestore, Storage) — via CDN ES modules
- **Google Apps Script** — order logging to Sheets
- **WhatsApp deep-link** — admin notifications

---

*Made with ♥ for students of Tripura*
