const express = require('express');
const serverless = require('serverless-http');
const { google } = require('googleapis');
const credentials = require('../atlas2.json');
const cors = require('cors');

const app = express();
const router = express.Router();
app.use(cors());

const spreadsheetId = '1hiwTlWXDzkhy7VrsMmCTRh2ksEbQ4noZwGjKC-VowD4';
const client = new google.auth.JWT(credentials.client_email, null, credentials.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
const range = 'website!A1';

router.get('/', async (req, res) => {
	// res.json({
	// 	hello: 'hi!'
	// });
	try {
		// Authorize the client
		await client.authorize();

		// Access the Google Sheets API
		const sheets = google.sheets({ version: 'v4', auth: client });

		// Fetch data from the spreadsheet
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range
		});

		const values = response.data.values;
		res.json(values);
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

router.get('/test', (req, res) => {
	res.json({
		hello: 'hello!'
	});
});

app.use(`/.netlify/functions/sheet`, router);

module.exports = app;
module.exports.handler = serverless(app);
