// ============================================
//  Scholar Tripura — Shared Utilities (script.js)
// ============================================

// ── Config ───────────────────────────────────────────────────
export const CONFIG = {
  ADMIN_WHATSAPP: "918256913154",        // TODO: replace with admin WhatsApp number
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwKQB0dlbcv1plZtCVeBMUNgXycBC7CvQPxK_FsivHXTDswiLxI_GYyZMSiA0HCXjQXXg/exec", // TODO
  MAX_IMAGE_SIZE_MB: 1,
  MAX_IMAGES: 3,
  PLACEHOLDER_IMG: "https://placehold.co/300x400/f0ebe0/4a3f30?text=Book",

  // ── Cloudinary (free image hosting) ──────────────────────────
  // 1. Sign up free at https://cloudinary.com
  // 2. Dashboard → Settings → Upload → Add upload preset
  //    Set signing mode: Unsigned → Save
  // 3. Fill in your Cloud Name and Preset Name below
  CLOUDINARY_CLOUD_NAME: "dkb1idvup",   // e.g. "dxyz123abc"
  CLOUDINARY_UPLOAD_PRESET: "scholar_tripura",    // e.g. "scholar_tripura"
};

// ── Cloudinary Image Upload ───────────────────────────────────
// Uploads files directly from browser — no backend, no Firebase Storage needed
export async function uploadToCloudinary(files) {
  const urls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "scholar_tripura");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Cloudinary upload failed");
    }

    const data = await res.json();
    urls.push(data.secure_url);
  }

  return urls;
}

// ── Categories ────────────────────────────────────────────────
export const CATEGORIES = [
  "Science", "Humanities", "Commerce", "Mathematics",
  "Psychology", "Self-Help", "Fiction", "History",
  "Technology", "Medical", "Law", "Other"
];

// ── Toast Notifications ───────────────────────────────────────
let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = "info", duration = 3500) {
  const container = getToastContainer();
  const icons = { success: "✓", error: "✕", info: "ℹ" };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideInToast 0.3s ease reverse";
    setTimeout(() => toast.remove(), 280);
  }, duration);
}

// ── Form Validation ───────────────────────────────────────────
export function validateField(input) {
  const group = input.closest(".form-group");
  if (!group) return true;

  const errorEl = group.querySelector(".error-msg");
  let valid = true;
  let message = "";

  if (input.required && !input.value.trim()) {
    valid = false;
    message = "This field is required.";
  } else if (input.dataset.type === "phone" && input.value.trim() && !/^[6-9]\d{9}$/.test(input.value.trim())) {
    // Only validate phone format if a value has been entered
    valid = false;
    message = "Enter a valid 10-digit Indian phone number (starts with 6–9).";
  } else if (input.dataset.type === "pin" && input.value.trim() && !/^\d{6}$/.test(input.value.trim())) {
    // Only validate PIN format if a value has been entered
    valid = false;
    message = "PIN code must be exactly 6 digits.";
  }

  if (!valid) {
    input.classList.add("error");
    group.classList.add("has-error");
    if (errorEl) errorEl.textContent = message;
  } else {
    input.classList.remove("error");
    group.classList.remove("has-error");
  }

  return valid;
}

export function validateForm(formEl) {
  let allValid = true;
  formEl.querySelectorAll("[required], [data-type]").forEach(field => {
    if (!validateField(field)) allValid = false;
  });
  return allValid;
}

// ── Image Validation ──────────────────────────────────────────
export function validateImages(files) {
  const maxBytes = CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const errors = [];

  if (files.length > CONFIG.MAX_IMAGES) {
    errors.push(`Maximum ${CONFIG.MAX_IMAGES} images allowed.`);
    return errors;
  }

  Array.from(files).forEach(file => {
    if (!file.type.startsWith("image/")) {
      errors.push(`${file.name} is not an image.`);
    } else if (file.size > maxBytes) {
      errors.push(`${file.name} exceeds ${CONFIG.MAX_IMAGE_SIZE_MB}MB.`);
    }
  });

  return errors;
}

// ── WhatsApp Message Builder ──────────────────────────────────
export function sendWhatsAppAlert(orderData) {
  // Build a clear, readable WhatsApp message for the admin
  const lines = [
    "📚 *New Scholar Tripura Order*",
    "",
    `*Book:* ${orderData.bookTitle || "—"}`,
    `*Order Type:* ${orderData.orderType || "Buy"}`,
    `*Price:* ₹${orderData.price || 0}`,
    "",
    `*Customer Name:* ${orderData.name}`,
    `*Phone:* ${orderData.phone}`,
    `*Address:* ${orderData.address}, ${orderData.town}`,
    `*District:* ${orderData.district}, ${orderData.state} - ${orderData.pin}`,
    `*Payment Mode:* ${orderData.paymentMode}`,
    orderData.note ? `*Note:* ${orderData.note}` : "",
    "",
    `_Sent from Scholar Tripura · ${new Date().toLocaleString("en-IN")}_`
  ].filter(l => l !== null);

  const text = lines.join("\n");
  const url  = `https://wa.me/${CONFIG.ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// ── Google Sheets Submit ──────────────────────────────────────
export async function submitToGoogleSheets(data) {
  // NOTE: Apps Script Web Apps require no-cors mode from browser.
  // Use Content-Type: text/plain so the preflight is skipped —
  // Apps Script reads e.postData.contents regardless of content-type.
  try {
    await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",              // required — browser can't read response
      headers: { "Content-Type": "text/plain" },  // avoids CORS preflight
      body: JSON.stringify(data)    // Apps Script reads this via e.postData.contents
    });
    return true;
  } catch (err) {
    console.error("Google Sheets submit error:", err);
    return false;
  }
}

// ── URL Params ────────────────────────────────────────────────
export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function setParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
}

// ── Format Currency ───────────────────────────────────────────
export function formatPrice(val) {
  if (!val && val !== 0) return "—";
  return `₹${Number(val).toLocaleString("en-IN")}`;
}

// ── Truncate Text ─────────────────────────────────────────────
export function truncate(str, max = 60) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ── Relative Time ─────────────────────────────────────────────
export function timeAgo(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ── Navbar hamburger (init on any page with a navbar) ─────────
export function initNavbar() {
  const hamburger = document.querySelector(".hamburger");
  const nav       = document.querySelector(".navbar-nav");
  if (!hamburger || !nav) return;

  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // Close on outside click
  document.addEventListener("click", e => {
    if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove("open");
    }
  });

  // Set active link
  const current = window.location.pathname.split("/").pop();
  nav.querySelectorAll("a").forEach(a => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
}

// ── Modal helpers ─────────────────────────────────────────────
export function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add("open");
}

export function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove("open");
}

export function initModals() {
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-overlay")?.classList.remove("open");
    });
  });

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
}

// ── Tab switcher ──────────────────────────────────────────────
export function initTabs(containerEl) {
  if (!containerEl) return;

  containerEl.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      containerEl.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      containerEl.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      containerEl.querySelector(`#${target}`)?.classList.add("active");
    });
  });
}

// ── Book Card Builder ─────────────────────────────────────────
export function buildBookCard(book) {
  const img     = book.images?.[0] || CONFIG.PLACEHOLDER_IMG;
  const isSold  = book.sold;

  return `
    <div class="book-card" data-id="${book.id}" onclick="window.location.href='book.html?id=${book.id}'">
      <div class="book-card-img">
        <img src="${img}" alt="${book.title}" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMG}'">
        <span class="book-badge badge-${isSold ? 'sold' : book.condition === 'New' ? 'new' : 'old'}">
          ${isSold ? 'Sold Out' : book.condition}
        </span>
      </div>
      <div class="book-card-body">
        <div class="book-category">${book.category || ""}</div>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author || ""}</p>
        <div class="book-prices">
          <div class="price-tag">
            <span class="price-label">Buy</span>
            <span class="price-val">${formatPrice(book.buyPrice)}</span>
          </div>
          ${book.rentPrice ? `
          <div class="price-tag">
            <span class="price-label">Rent</span>
            <span class="price-val rent">${formatPrice(book.rentPrice)}/mo</span>
          </div>` : ""}
        </div>
        ${!isSold ? `
        <div class="book-actions">
          <button class="btn btn-primary" onclick="event.stopPropagation(); buyBook('${book.id}')">Buy Now</button>
          ${book.rentPrice ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); rentBook('${book.id}')">Rent</button>` : ""}
        </div>` : `
        <div class="book-actions">
          <button class="btn btn-secondary" disabled style="flex:1;opacity:0.5;">Sold Out</button>
        </div>`}
      </div>
    </div>
  `;
}

// ── Navigate to order form ────────────────────────────────────
window.buyBook = function(bookId) {
  window.location.href = `form.html?id=${bookId}&type=buy`;
};
window.rentBook = function(bookId) {
  window.location.href = `form.html?id=${bookId}&type=rent`;
};
