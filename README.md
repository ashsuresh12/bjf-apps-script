# BJF Shopify Product Automation Scripts

This repository contains Google Apps Script functions used to automate the creation and upload of product data into Shopify for Border Just Foods (BJF). Scripts are built to read from Google Sheets, process product variants, and generate high-quality product descriptions and SEO metadata using OpenAI.

---

## 💼 Key Functionality

- ✅ Generates Shopify-ready CSV output from Google Sheets
- ✅ Supports products with multiple variants
- ✅ Writes product descriptions in a neutral UK English tone
- ✅ Auto-generates SEO titles and SEO meta descriptions
- ✅ Outputs mapped to Shopify's 106-column import format
- ✅ Incremental version control per Ash’s workflow

---

## 🔐 Version Control Policy

All changes to scripts must be:

- **Approved incrementally**
- **Manually committed** after approval
- **Logged clearly** in this README and Git commit messages

---

## 📌 Version History

### v1.3 – Fix SEO title column and refine SEO description prompt
- SEO Title now writes to column **BN** (index 66)
- SEO Description remains in column **BO** (index 67)
- SEO meta prompt now explicitly tied to food/pantry context
- Prevents hallucinated output like fashion items

<!-- Add future versions here like:
### v1.4 – Added batching logic for 100-row processing
- [details here]
-->

---

## 🛠️ Tech Stack

- Google Apps Script (via Apps Script Editor)
- OpenAI GPT (via `gpt-4o`)
- GitHub (manual backup)
