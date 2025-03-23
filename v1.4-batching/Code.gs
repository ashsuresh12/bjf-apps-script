// v1.4 – Stable Apps Script batching
function processNext100Products() {
  const RAW_SHEET_NAME = 'Raw Data 22Mar';
  const OUTPUT_SHEET_NAME = 'Local Template';
  const BATCH_TOTAL = 100;
  const SUB_BATCH_SIZE = 20;
  const TIMEOUT_LIMIT_MS = 5 * 60 * 1000;
  const MAX_COLUMNS = 106;

  const props = PropertiesService.getScriptProperties();
  const lastProcessed = parseInt(props.getProperty('lastProcessed') || '0');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName(RAW_SHEET_NAME);
  const outputSheet = ss.getSheetByName(OUTPUT_SHEET_NAME);

  const startTime = new Date().getTime();
  let processedCount = 0;

  while (processedCount < BATCH_TOTAL) {
    if (new Date().getTime() - startTime > TIMEOUT_LIMIT_MS) {
      Logger.log('Approaching timeout. Exiting safely.');
      break;
    }

    const startRow = 4 + lastProcessed + processedCount;
    const data = rawSheet.getRange(startRow, 2, SUB_BATCH_SIZE, 8).getValues();
    if (data.every(row => row[1] === '')) break;

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
        rowOutput[65] = getSeoTitle(websiteTitle, variant);
        rowOutput[66] = seoDescription;

        while (rowOutput.length < MAX_COLUMNS) rowOutput.push('');
        outputRows.push(rowOutput);
      });
    });

    const outputStartRow = 4 + lastProcessed + processedCount;
    outputSheet.getRange(outputStartRow, 1, outputRows.length, MAX_COLUMNS).setValues(outputRows);
    processedCount += SUB_BATCH_SIZE;
    Utilities.sleep(1000);
  }

  props.setProperty('lastProcessed', lastProcessed + processedCount);
}

function resetBatchProgress() {
  PropertiesService.getScriptProperties().deleteProperty('lastProcessed');
  SpreadsheetApp.getUi().alert('Batch progress has been reset.');
}

function resetBatchToRow4() {
  PropertiesService.getScriptProperties().setProperty('lastProcessed', '2');
  SpreadsheetApp.getUi().alert('Progress reset. Next run will begin from Row 4.');
}

function addMenuButtons() {
  SpreadsheetApp.getUi()
    .createMenu('BJF Automation')
    .addItem('▶ Resume 100 Products', 'processNext100Products')
    .addItem('🔁 Reset Progress', 'resetBatchProgress')
    .addToUi();
}

function onOpen() {
  addMenuButtons();
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
  const prompt = `Write a concise, neutral product description in UK English for '${title}'. Avoid repeating the title at the start. Do not include any reference to product sizes like '250g' or '1L'. Keep it under 400 characters, avoid salesy tone, and ensure natural, flowing copy. No headers or bullet points.`;
  return getGPTResponse(prompt);
}

function generateSEODescription(title) {
  const prompt = `Write an SEO-friendly description in UK English under 160 characters for a food or pantry item called '${title}'. Do not mention the product title or size. Start with a natural phrase and include a real-world benefit or use.`;
  return getGPTResponse(prompt);
}

function getGPTResponse(prompt) {
  const apiKey = 'YOUR_OPENAI_API_KEY';
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a UK English product content writer. Keep descriptions authentic, neutral, and practical. Avoid repeating \"Discover\" or \"Indulge\".'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 200,
    temperature: 0.7
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    const result = JSON.parse(response.getContentText());
    if (result.error) {
      Logger.log('OpenAI Error: ' + result.error.message);
      return 'Error: ' + result.error.message;
    }
    return result.choices[0].message.content.trim();
  } catch (e) {
    Logger.log('Request failed: ' + e.message);
    return 'Error: ' + e.message;
  }
}
