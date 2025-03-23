function processFirst5ProductsWithDescriptions() {
  const RAW_SHEET_NAME = 'Raw Data 22Mar';
  const OUTPUT_SHEET_NAME = 'Local Template';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName(RAW_SHEET_NAME);
  const outputSheet = ss.getSheetByName(OUTPUT_SHEET_NAME);

  const data = rawSheet.getRange(2, 2, 5, 8).getValues(); // B2:I for first 5 rows

  const outputRows = [];

  data.forEach(row => {
    const productTitle = row[1];
    const collections = row[2] || '';
    const websiteTitle = row[3] || productTitle;
    const variantsRaw = row[4];
    const extraCollection = row[6] || '';

    if (!productTitle || !variantsRaw) return;

    const variants = variantsRaw.split(',').map(v => v.trim());
    const combinedTags = formatTags(collections + ',' + extraCollection);
    const handle = productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    variants.forEach(variant => {
      const title = `${websiteTitle} - ${variant}`;
      const description = generateDescription(websiteTitle);
      const seoDescription = generateSEODescription(websiteTitle);

      const rowOutput = [];
      rowOutput[0] = handle;
      rowOutput[1] = title;
      rowOutput[2] = description;
      rowOutput[3] = 'BJF';
      rowOutput[4] = 'Oil';
      rowOutput[5] = combinedTags;
      rowOutput[9] = 'TRUE';
      rowOutput[34] = 'Size';
      rowOutput[35] = variant;
      rowOutput[65] = getSeoTitle(websiteTitle, variant); // Column BN
      rowOutput[66] = seoDescription; // Column BO

      while (rowOutput.length < 106) rowOutput.push('');
      outputRows.push(rowOutput);
    });
  });

  const startOutputRow = 5;
  outputSheet.getRange(startOutputRow, 1, outputRows.length, 106).setValues(outputRows);
}

function formatTags(rawTags) {
  return rawTags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag)
    .map(tag => tag.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '))
    .join(', ');
}

function getSeoTitle(product, variant) {
  let base = `${product} (${variant})`;
  if (base.length > 60) base = base.slice(0, 57) + '...';
  return base;
}

function generateDescription(title) {
  var prompt = `Write a concise, neutral product description in UK English for '${title}'. Avoid repeating the title at the start. Do not include any reference to product sizes like '250g' or '1L'. Keep it under 400 characters, avoid salesy tone, and ensure natural, flowing copy. No headers or bullet points.`;
  return getGPTResponse(prompt);
}

function generateSEODescription(title) {
  var prompt = `Write an SEO-friendly description in UK English under 160 characters for a food or pantry item called '${title}'. Do not mention the product title or size. Start with a natural phrase and include a real-world benefit or use.`;
  return getGPTResponse(prompt);
}

function getGPTResponse(prompt) {
  var apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your actual key
  var endpoint = 'https://api.openai.com/v1/chat/completions';

  var payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a UK English product content writer. Keep descriptions authentic, neutral, and practical. Avoid repeating 'Discover' or 'Indulge'."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 200,
    temperature: 0.7
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(endpoint, options);
    var result = JSON.parse(response.getContentText());
    if (result.error) {
      Logger.log("OpenAI Error: " + result.error.message);
      return "Error: " + result.error.message;
    }
    return result.choices[0].message.content.trim();
  } catch (e) {
    Logger.log("Request failed: " + e.message);
    return "Error: " + e.message;
  }
}

