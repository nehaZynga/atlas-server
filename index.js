const express = require('express');
const { google } = require('googleapis');
const credentials = require('../atlas2.json');
const cors = require('cors');
const methodOverride = require('method-override');
const app = express();
app.set('view engine', 'ejs');
// app.use(express.urlencoded({ extended: true }));
app.use(express());
app.use(
	cors({
		origin: '*'
	})
);
// app.use(
//   cors({
//     origin: 'https://roadmap.zynga.com:3000'
//   })
// );

// app.all('*', function (req, res, next) {
//   console.log('req ', req);
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//   next();
// });

// app.use(express.methodOverride());

// ## CORS middleware
//
var allowCrossDomain = function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(allowCrossDomain);

const spreadsheetId = '1hiwTlWXDzkhy7VrsMmCTRh2ksEbQ4noZwGjKC-VowD4';
const range = 'website!A1';

app.get('/', (req, res) => {
	res.render('index');
});

const client = new google.auth.JWT(credentials.client_email, null, credentials.private_key, ['https://www.googleapis.com/auth/spreadsheets']);

app.get('/sheet', async (req, res) => {
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

app.put('/sheet/update', async (req, res) => {
	try {
		// Authorize the client
		await client.authorize();

		// Access the Google Sheets API
		const sheets = google.sheets({ version: 'v4', auth: client });

		// Get the new value from the request body
		// const newValue = req.body.newValue;
		const newValue = 'testtest';

		// Update the cell value in the spreadsheet
		const request = {
			spreadsheetId,
			range,
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: [[newValue]]
			}
		};

		const response = await sheets.spreadsheets.values.update(request);
		res.json({ message: 'Cell updated successfully' });
	} catch (error) {
		console.error('Error updating cell:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/sheet', async (req, res) => {
	console.log('sheet API ===========');
	const { request, name } = req.body;

	const auth = new google.auth.GoogleAuth({
		keyFile: credentials,
		scopes: 'https://www.googleapis.com/auth/spreadsheets'
	});

	// Create client instance for auth
	const client = await auth.getClient();

	// Instance of Google Sheets API
	const googleSheets = google.sheets({ version: 'v4', auth: client });

	// Get metadata about spreadsheet
	const metaData = await googleSheets.spreadsheets.get({
		auth,
		spreadsheetId
	});

	console.log('metaData ', metaData);

	// Read rows from spreadsheet
	// const getRows = await googleSheets.spreadsheets.values.get({
	//   auth,
	//   spreadsheetId,
	//   range: 'website!A:A'
	// });

	// // Write row(s) to spreadsheet
	// await googleSheets.spreadsheets.values.append({
	//   auth,
	//   spreadsheetId,
	//   range: 'website!A:B',
	//   valueInputOption: 'USER_ENTERED',
	//   resource: {
	//     values: [[request, name]]
	//   }
	// });

	// res.send('Successfully submitted! Thank you!');
});

app.listen(1337, (req, res) => console.log('running on 1337'));
