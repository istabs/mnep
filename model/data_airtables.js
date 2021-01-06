var projects = {};

var rawData = [];

function Project(snap) {
	this.name = snap.child('name').val();
	this.pattern = snap.child('pattern').val();
	this.authorization = snap.child('credentials').child('authorization').val();
	this.key = snap.child('credentials').child('key').val();
	this.table = snap.child('details').child('table').val();
	this.maptype = snap.child('details').child('maptype').val();
	this.label = snap.child('details').child('mapping').child('label').val();
	this.start = snap.child('details').child('mapping').child('start').val();
	this.end = snap.child('details').child('mapping').child('end').val();
	this.group = snap.child('details').child('mapping').child('group').val();
	this.parent = snap.child('details').child('mapping').child('parent').val();
	this.progress = snap.child('details').child('mapping').child('progress').val();
	this.summary = snap.child('details').child('mapping').child('summary').val();
	this.link = snap.child('details').child('mapping').child('link').val();
	this.height = snap.child('details').child('height').val();
	this.isSummarize = snap.child('details').child('isSummarize').val();
	this.url = snap.child('credentials').child('url').val();
	this.clientId = snap.child('credentials').child('clientId').val();
	this.secret = snap.child('credentials').child('secret').val();
}

function MngdUser(user) {
	this.name = user.name;
	this.email = user.email;
	this.key = user.email.replace(new RegExp('\\.', 'g'), '%2E');
	this.basePath = "/sources/users/catalog/";

	this.onDefault = callback => {
		let defaultPath = this.basePath + this.key + "/default";
		let dbRef1 = firebase.database().ref(defaultPath);
		dbRef1.once('value').then(snap => {
			let defaultTag = snap.val();
			let defaultPrjPath = "/sources/projects/" + defaultTag;
			let dbRef2 = firebase.database().ref(defaultPrjPath);
			dbRef2.once('value').then(snap => {
				let prjName = snap.child('name').val();
				callback(prjName);
			});
		});
	}

	this.onMenu = function (callback) {
		this.menuPath = this.basePath + this.key + "/list";
		let dbRef1 = firebase.database().ref(this.menuPath);
		let projectsLst = [];
		dbRef1.once('value').then(snap => {
			snap.forEach(record => {
				this.menuPath = "/sources/projects/" + record.val();
				dbRef2 = firebase.database().ref(this.menuPath);
				dbRef2.once('value').then(snap => {
					let project = new Project(snap);
					projects[project.name] = new Project(snap);
					projectsLst.push(project)
				}).then(() => callback(projectsLst));
			});
		});
	}
}

function readAirtablesData(url, project, chartPlaceholders, acc, callback) {
	$.ajax({
		url: url,
		beforeSend: (xhr) => xhr.setRequestHeader("Authorization", project.authorization),
		success: (rawData) => {
			rawData.records.forEach(record => acc.push(record))
			if (rawData.offset) {
				readAirtablesData(url + '?offset=' + rawData.offset, project, chartPlaceholders, acc, callback);
				return;
			}
			callback(project, chartPlaceholders, acc);
		}
	});
}

url = 'https://docs.google.com/spreadsheets/d/19D2cU8pCGkN4sl5DDXjLlYbd8LoNDHKmEJJ7l2cs1lY';
var ssid = '19D2cU8pCGkN4sl5DDXjLlYbd8LoNDHKmEJJ7l2cs1lY';
var clientId = '1027876211335-93p0ngrnrnb2tmt8hbadhchvj77r23kf.apps.googleusercontent.com';
var apiKey = 'AIzaSyBLno126jESgr7JzuOADmImv1D0EkBkfNI';
var scopes = 'https://www.googleapis.com/auth/spreadsheets';

// Client ID and API key from the Developer Console
var CLIENT_ID = clientId;
var API_KEY = apiKey;

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

//var authorizeButton = document.getElementById('authorize_button');
//var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

		// Handle the initial sign-in state.
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		//authorizeButton.onclick = handleAuthClick;
		//signoutButton.onclick = handleSignoutClick;
	}, function (error) {
		appendPre(JSON.stringify(error, null, 2));
	});
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		//authorizeButton.style.display = 'none';
		//signoutButton.style.display = 'block';
		console.log('Signed In');
		listMajors();
	} else {
		console.log('Signed Out');
		handleAuthClick();
		//authorizeButton.style.display = 'block';
		//signoutButton.style.display = 'none';
	}
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
	//var pre = document.getElementById('content');
	//var textContent = document.createTextNode(message + '\n');
	//pre.appendChild(textContent);
	console.log(message);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors() {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId: ssid, //'1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
		range: 'Ctr!B1:F', //'Class Data!A2:E',
	}).then(function (response) {
		var range = response.result;
		if (range.values.length > 0) {
			appendPre('Name, Major:');
			for (i = 0; i < range.values.length; i++) {
				var row = range.values[i];
				// Print columns A and E, which correspond to indices 0 and 4.
				appendPre(row[0] + ', ' + row[4]);
			}
		} else {
			appendPre('No data found.');
		}
	}, function (response) {
		appendPre('Error: ' + response.result.error.message);
	});
}

function readGoogleSheetsData(url, project, chartPlaceholders, acc, callback) {

	var curriedInitClient = initClient.curry(project, chartPlaceholders, acc);
	gapi.load('client:auth2', curriedInitClient)

	/*
	$.ajax({
		url: url + '?callback=googleDocCallback',
		beforeSend: (xhr) => {
			xhr.setRequestHeader("Authorization", project.authorization);
			//xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		},
		success: (rawData) => {
			console.log(rawData);
			rawData.records.forEach(record => acc.push(record))
			if (rawData.offset) {
				readAirtablesData(url + '?offset=' + rawData.offset, project, chartPlaceholders, acc, callback);
				return;
			}
			callback(project, chartPlaceholders, acc);
		},
		error: (error) => {
			console.log(error);
		}
	});
	*/
}