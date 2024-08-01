const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const credentials = {
  "web": {
    "client_id": "643360375472-5qs5unmth6v76jfsos98dfrat9d08tvs.apps.googleusercontent.com",
    "project_id": "veb-calculator-js",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "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",
    "redirect_uris": ["http://localhost:3001/callback"]
  }
};

const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});

console.log('Authorize this app by visiting this URL:', authUrl);

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Access token:', tokens.access_token);

    res.send('Authorization successful!');
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).json({ error: 'Failed to retrieve access token' });
  }
});

const sheets = google.sheets({ version: "v4", auth: oauth2Client });
const drive = google.drive({ version: "v3", auth: oauth2Client });
const docs = google.docs({ version: 'v1', auth: oauth2Client });

let cachedData = null;
let cacheTimestamp = 0;
const cacheTimeout = 15 * 60 * 1000;

async function getDataFromGoogleSheets() {
  try {
    const spreadsheetId = "12fx52NnNB1q2x1sTUblsrhlgw6nCwNnBIAum9EdpgiE";

    if (cachedData && Date.now() - cacheTimestamp < cacheTimeout) {
      return cachedData;
    }

    const response1 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Склад ЖБИ",
    });

    const response2 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Справочник ЖБИ",
    });

    const response3 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Справочник производств",
    });

    const response4 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Справочник доставок",
    });

    const data1 = response1.data.values;
    const data2 = response2.data.values;
    const data3 = response3.data.values;
    const data4 = response4.data.values;

    const responseData = {
      stockSheet: data1,
      directorySheet: data2,
      productionSheet: data3,
      deliverySheet: data4,
    };

    cachedData = responseData;
    cacheTimestamp = Date.now();

    return responseData;
  } catch (error) {
    console.error("Error retrieving data from Google Sheets:", error);
    throw error;
  }
}

// Функция для копирования файла на Google Drive
async function copyFileToDrive(fileId, folderId) {
  try {
    const response = await drive.files.copy({
      fileId: fileId,
      requestBody: {
        parents: [folderId]
      }
    });

    const copyId = response.data.id;
    console.log('File copied successfully. Copy ID:', copyId);

    return copyId;
  } catch (error) {
    console.error('Error copying file:', error);
    throw new Error('Failed to copy file');
  }
}

// Функция для внесения изменений в документ
async function updateDocument(documentId, replacements) {
  const requests = replacements.map(replacement => ({
    replaceAllText: {
      containsText: {
        text: replacement.placeholder,
        matchCase: true,
      },
      replaceText: replacement.value,
    },
  }));

  try {
    await docs.documents.batchUpdate({
      documentId: documentId,
      requestBody: {
        requests: requests,
      },
    });
    console.log('Document updated successfully.');
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
}

// Функция для конвертации документа в PDF и скачивания
async function downloadPdfFromDrive(docId) {
  try {
    const response = await drive.files.export({
      fileId: docId,
      mimeType: 'application/pdf',
    }, { responseType: 'arraybuffer' });

    const pdfContent = Buffer.from(response.data);
    return pdfContent.toString('base64');
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
}

// Основная функция для создания PDF
async function createPDF(templateId, folderId, replacements) {
  try {
    const copyId = await copyFileToDrive(templateId, folderId);

    await updateDocument(copyId, replacements);

    const base64Pdf = await downloadPdfFromDrive(copyId);

    // Удаляем временный файл после обработки
    await drive.files.delete({ fileId: copyId });

    return base64Pdf;
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw new Error('Failed to create PDF');
  }
}

app.post('/api/create-pdf', async (req, res) => {
  const { templateId, folderId, replacements } = req.body;

  try {
    const base64Pdf = await createPDF(templateId, folderId, replacements);
    res.send(base64Pdf);
  } catch (error) {
    console.error('Error creating PDF:', error);
    res.status(500).json({ error: 'Failed to create PDF' });
  }
});


app.get("/api/pdf/:pdfId", async (req, res) => {
  try {
    const pdfId = req.params.pdfId;
    const base64Pdf = await downloadPdfFromDrive(pdfId);
    res.send(base64Pdf);
  } catch (error) {
    console.error("Failed to download PDF:", error);
    res.status(500).json({ error: "Failed to download PDF" });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const data = await getDataFromGoogleSheets();
    res.json(data);
  } catch (error) {
    console.error("Failed to retrieve data:", error);
    res.status(500).json({ error: "Failed to retrieve data" });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
