// ============================================
//  Scholar Tripura — Google Apps Script
//  PASTE THIS INTO GOOGLE APPS SCRIPT EDITOR
//  Extensions > Apps Script > paste > save > deploy
// ============================================

var SHEET_NAME_ORDERS = "Orders";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput("No data received")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    var data = JSON.parse(e.postData.contents);
    appendOrder(data);

    Logger.log("Order saved: " + JSON.stringify(data));

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
  var sheet = ss.getSheetByName(SHEET_NAME_ORDERS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_ORDERS);
    sheet.appendRow([
      "Timestamp",
      "Book Title",
      "Order Type",
      "Price (Rs)",
      "Customer Name",
      "Phone",
      "Address",
      "Town",
      "District",
      "State",
      "PIN Code",
      "Payment Mode",
      "Note",
      "Book ID"
    ]);

    var headerRange = sheet.getRange(1, 1, 1, 14);
    headerRange.setBackground("#1a1510");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var timestamp = new Date().toLocaleString();

  sheet.appendRow([
    timestamp,
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

  sheet.autoResizeColumns(1, 14);
}

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
  Logger.log("Test row appended.");
}
