// ============================================
//  Scholar Tripura — Google Apps Script v3
//  HANDLES: Orders + Enlist Requests
//  METHOD: GET with URL params (most reliable, no CORS issues)
// ============================================

var SHEET_ORDERS = "Orders";
var SHEET_ENLIST = "Enlist Requests";

// GET handler — receives all data as URL parameters
function doGet(e) {
  try {
    var params = e.parameter;

    if (!params || !params.type) {
      return ContentService
        .createTextOutput("Scholar Tripura script running. Missing type param.")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    if (params.type === "enlist") {
      appendEnlist(params);
    } else if (params.type === "order") {
      appendOrder(params);
    }

    Logger.log("Saved: " + JSON.stringify(params));

    // Return JSONP-style so browser doesn't complain
    return ContentService
      .createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    Logger.log("Error: " + err.message);
    return ContentService
      .createTextOutput("Error: " + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// POST handler kept as fallback
function doPost(e) {
  return doGet(e);
}

function appendOrder(p) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_ORDERS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ORDERS);
    sheet.appendRow([
      "Timestamp", "Book Title", "Order Type", "Price (Rs)",
      "Customer Name", "Phone", "Address", "Town",
      "District", "State", "PIN Code", "Payment Mode", "Note", "Book ID"
    ]);
    styleHeader(sheet, 14);
  }

  sheet.appendRow([
    new Date().toLocaleString(),
    p.bookTitle   || "",
    p.orderType   || "",
    p.price       || "",
    p.name        || "",
    p.phone       || "",
    p.address     || "",
    p.town        || "",
    p.district    || "",
    p.state       || "",
    p.pin         || "",
    p.paymentMode || "",
    p.note        || "",
    p.bookId      || ""
  ]);

  sheet.autoResizeColumns(1, 14);
}

function appendEnlist(p) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_ENLIST);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ENLIST);
    sheet.appendRow([
      "Timestamp", "Book Name", "Author", "Published",
      "Subject", "Condition", "Selling Price (Rs)", "Renting Price (Rs)",
      "Description", "Seller Name", "Phone", "Address", "Images", "Status"
    ]);
    styleHeader(sheet, 14);
  }

  sheet.appendRow([
    new Date().toLocaleString(),
    p.bookName     || "",
    p.author       || "",
    p.pubDate      || "",
    p.subject      || "",
    p.condition    || "",
    p.sellingPrice || "",
    p.rentingPrice || "",
    p.description  || "",
    p.sellerName   || "",
    p.phone        || "",
    p.address      || "",
    p.images       || "",
    "Pending"
  ]);

  sheet.autoResizeColumns(1, 14);
}

function styleHeader(sheet, cols) {
  var range = sheet.getRange(1, 1, 1, cols);
  range.setBackground("#1a1510");
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

// Run this manually to test — select testEnlist() and click Run
function testEnlist() {
  appendEnlist({
    bookName: "Physics NCERT", author: "NCERT", pubDate: "2022",
    subject: "Science", condition: "Old", sellingPrice: "150",
    rentingPrice: "30", description: "Good condition",
    sellerName: "Debajit", phone: "9862676450",
    address: "Udaipur, Tripura", images: "https://example.com/img.jpg"
  });
  Logger.log("Test enlist row added.");
}

function testOrder() {
  appendOrder({
    bookTitle: "Test Book", orderType: "Buy", price: "250",
    name: "Test User", phone: "9876543210", address: "123 Street",
    town: "Agartala", district: "West Tripura", state: "Tripura",
    pin: "799001", paymentMode: "UPI", note: "", bookId: "test123"
  });
  Logger.log("Test order row added.");
}
