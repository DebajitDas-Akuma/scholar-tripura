// ============================================
//  Scholar Tripura — Google Apps Script
//  DEPLOYMENT INSTRUCTIONS:
//  1. Open Google Sheets → Extensions → Apps Script
//  2. Paste this entire file
//  3. Deploy → New Deployment → Web App
//  4. Execute as: Me | Access: Anyone
//  5. Copy the deployment URL → paste into CONFIG.GOOGLE_SCRIPT_URL in script.js
// ============================================

const SHEET_NAME_ORDERS = "Orders";
const SHEET_NAME_ENLIST = "Enlist Requests";

// NOTE: Requests from the browser use mode:"no-cors" (required for cross-origin).
// This means the browser sends the request but CANNOT read the response.
// The server still receives and processes it — that is expected behaviour.
// Content-Type is sent as "text/plain" to avoid CORS preflight checks.
// Apps Script reads the body via e.postData.contents regardless of Content-Type.

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No POST body received.");
    }

    const data = JSON.parse(e.postData.contents);
    const type = data.type || "order";  // default: order submission

    if (type === "order") {
      appendOrder(data);
    }

    // Response is not readable by browser (no-cors), but log it anyway
    Logger.log("Processed: " + JSON.stringify(data));

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET handler — useful for manual testing from browser address bar
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Scholar Tripura Apps Script is running ✓" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function appendOrder(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME_ORDERS);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_ORDERS);
    sheet.appendRow([
      "Timestamp", "Book Title", "Order Type", "Price (₹)",
      "Customer Name", "Phone", "Address", "Town", "District",
      "State", "PIN Code", "Payment Mode", "Note", "Book ID"
    ]);
    // Style header
    sheet.getRange(1, 1, 1, 14)
      .setBackground("#1a1510")
      .setFontColor("#faf7f2")
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date().toLocaleString("en-IN"),
    data.bookTitle    || "",
    data.orderType    || "",
    data.price        || "",
    data.name         || "",
    data.phone        || "",
    data.address      || "",
    data.town         || "",
    data.district     || "",
    data.state        || "",
    data.pin          || "",
    data.paymentMode  || "",
    data.note         || "",
    data.bookId       || ""
  ]);

  // Auto-resize columns
  sheet.autoResizeColumns(1, 14);
}

// ── Test function — run manually to verify ───────────────────
function testAppend() {
  appendOrder({
    bookTitle:   "Test Book",
    orderType:   "Buy",
    price:       "250",
    name:        "Test User",
    phone:       "9876543210",
    address:     "123 Test Street",
    town:        "Agartala",
    district:    "West Tripura",
    state:       "Tripura",
    pin:         "799001",
    paymentMode: "UPI",
    note:        "Test order",
    bookId:      "test123"
  });
  Logger.log("Test row appended to Orders sheet.");
}
