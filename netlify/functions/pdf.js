const { google } = require('googleapis');
const drive = google.drive('v3');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

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
  const pdfId = event.path.split('/').pop();

  try {
    const base64Pdf = await downloadPdfFromDrive(pdfId);
    return {
      statusCode: 200,
      body: base64Pdf
    };
  } catch (error) {
    console.error("Failed to download PDF:", error);
    return {
      statusCode: 500,
      body: 'Failed to download PDF'
    };
  }
};
