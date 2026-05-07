// ============================================
//  Scholar Tripura — Google Apps Script
//  Handles BOTH orders AND enlist requests
//  PASTE INTO: Extensions > Apps Script
//  Deploy as Web App > Anyone > Execute as Me
// ============================================

var SHEET_ORDERS  = "Orders";
var SHEET_ENLIST  = "Enlist Requests";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput("No data received")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    var data = JSON.parse(e.postData.contents);
    var type = data.type || "order";

    if (type === "enlist") {
      appendEnlist(data);
    } else {
      appendOrder(data);
    }

    Logger.log("Saved [" + type + "]: " + JSON.stringify(data));

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

function doGet(e) {
  return ContentService
    .createTextOutput("Scholar Tripura Apps Script is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function appendOrder(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_ORDERS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ORDERS);
    sheet.appendRow([
      "Timestamp", "Book Title", "Order Type", "Price (Rs)",
      "Customer Name", "Phone", "Address", "Town",
      "District", "State", "PIN Code", "Payment Mode",
      "Note", "Book ID"
    ]);
    styleHeader(sheet, 14);
  }

  sheet.appendRow([
    new Date().toLocaleString(),
    data.bookTitle   || "",
    data.orderType   || "",
    data.price       || "",
    data.name        || "",
    data.phone       || "",
    data.address     || "",
    data.town        || "",
    data.district    || "",
    data.state       || "",
    data.pin         || "",
    data.paymentMode || "",
    data.note        || "",
    data.bookId      || ""
  ]);

  sheet.autoResizeColumns(1, 14);
}

function appendEnlist(data) {
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
    data.bookName     || "",
    data.author       || "",
    data.pubDate      || "",
    data.subject      || "",
    data.condition    || "",
    data.sellingPrice || "",
    data.rentingPrice || "",
    data.description  || "",
    data.sellerName   || "",
    data.phone        || "",
    data.address      || "",
    (data.images || []).join(", "),
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

function testOrder() {
  appendOrder({
    bookTitle: "Test Book", orderType: "Buy", price: "250",
    name: "Test User", phone: "9876543210", address: "123 Street",
    town: "Agartala", district: "West Tripura", state: "Tripura",
    pin: "799001", paymentMode: "UPI", note: "", bookId: "test123"
  });
  Logger.log("Test order appended.");
}

function testEnlist() {
  appendEnlist({
    bookName: "Physics NCERT", author: "NCERT", pubDate: "2022",
    subject: "Science", condition: "Old", sellingPrice: "150",
    rentingPrice: "30", description: "Good condition",
    sellerName: "Debajit", phone: "9862676450",
    address: "Udaipur, Tripura", images: ["https://example.com/img.jpg"]
  });
  Logger.log("Test enlist appended.");
}
