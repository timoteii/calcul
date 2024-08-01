const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const sheets = google.sheets('v4');

const getDataFromGoogleSheets = async () => {
  const spreadsheetId = "12fx52NnNB1q2x1sTUblsrhlgw6nCwNnBIAum9EdpgiE";

  try {
    const response1 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Склад ЖБИ",
      auth: oauth2Client
    });

    const response2 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Справочник ЖБИ",
      auth: oauth2Client
    });

    const response3 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Справочник производств",
      auth: oauth2Client
    });

    const response4 = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Справочник доставок",
      auth: oauth2Client
    });

    return {
      stockSheet: response1.data.values,
      directorySheet: response2.data.values,
      productionSheet: response3.data.values,
      deliverySheet: response4.data.values
    };
  } catch (error) {
    console.error("Error retrieving data from Google Sheets:", error);
    throw new Error('Failed to retrieve data');
  }
};

exports.handler = async (event, context) => {
  try {
    const data = await getDataFromGoogleSheets();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Failed to retrieve data:", error);
    return {
      statusCode: 500,
      body: 'Failed to retrieve data',
    };
  }
};
