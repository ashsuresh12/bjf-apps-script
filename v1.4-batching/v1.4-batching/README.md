# BJF Apps Script – v1.4 Batching

## ✅ Summary
Stable version of the Google Apps Script automation for BJF Shopify sheet upload.

## 🔧 Features
- Processes 100 products in sub-batches of 20
- Reads from "Raw Data 22Mar" starting at **row 4**
- Writes to "Local Template" starting at **row 4**
- Tracks progress via `ScriptProperties` (`lastProcessed`)
- Adds custom menu to Sheet: 
  - ▶ Resume 100 Products
  - 🔁 Reset Progress
- SEO titles & descriptions written to columns BN and BO

## 🔁 Resume Logic
To reset the script to start again from row 4:
```js
resetBatchToRow4();
