const { google } = require('googleapis');

const credentials = {
  "web": {
    "client_id": process.env.GOOGLE_CLIENT_ID,
    "client_secret": process.env.GOOGLE_CLIENT_SECRET,
    "redirect_uris": ["http://localhost:3000/.netlify/functions/callback"]
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

exports.handler = async (event, context) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  return {
    statusCode: 302,
    headers: {
      Location: authUrl
    }
  };
};
