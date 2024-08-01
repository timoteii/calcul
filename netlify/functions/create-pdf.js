const { google } = require('googleapis');
const drive = google.drive('v3');
const docs = google.docs('v1');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const copyFileToDrive = async (fileId, folderId) => {
  try {
    const response = await drive.files.copy({
      fileId: fileId,
      requestBody: { parents: [folderId] },
      auth: oauth2Client
    });
    return response.data.id;
  } catch (error) {
    console.error('Error copying file:', error);
    throw new Error('Failed to copy file');
  }
};

const updateDocument = async (documentId, replacements) => {
  const requests = replacements.map(replacement => ({
    replaceAllText: {
      containsText: { text: replacement.placeholder, matchCase: true },
      replaceText: replacement.value,
    },
  }));

  try {
    await docs.documents.batchUpdate({
      documentId: documentId,
      requestBody: { requests: requests },
      auth: oauth2Client
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
};

const downloadPdfFromDrive = async (docId) => {
  try {
    const response = await drive.files.export({
      fileId: docId,
      mimeType: 'application/pdf',
      responseType: 'arraybuffer',
      auth: oauth2Client
    });
    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
};

exports.handler = async (event, context) => {
  const { templateId, folderId, replacements } = JSON.parse(event.body);

  try {
    const copyId = await copyFileToDrive(templateId, folderId);
    await updateDocument(copyId, replacements);
    const base64Pdf = await downloadPdfFromDrive(copyId);

    return {
      statusCode: 200,
      body: base64Pdf
    };
  } catch (error) {
    console.error('Error creating PDF:', error);
    return {
      statusCode: 500,
      body: 'Failed to create PDF'
    };
  }
};
