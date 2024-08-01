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

exports.handler = async (event, context) => {
  const code = event.queryStringParameters.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return {
      statusCode: 200,
      body: 'Authorization successful!',
    };
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return {
      statusCode: 500,
      body: 'Failed to retrieve access token',
    };
  }
};
