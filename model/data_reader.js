var projects = {};

var rawData = [];

let projectPatterns = {
	'AirTables': ProjectAirTables,
	'GoogleSheets': ProjectGSheets,
}

function ProjectAirTables(snap) {
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
}

function ProjectGSheets(snap) {
	this.name          = snap.child('name').val();
	this.pattern       = snap.child('pattern').val();
	this.apiKey        = snap.child('credentials').child('apiKey').val();
	this.clientId      = snap.child('credentials').child('clientId').val();
	this.spreadsheetId = snap.child('credentials').child('spreadsheetId').val();
	this.scopes        = snap.child('credentials').child('scopes').val();
	this.discoveryDocs = snap.child('credentials').child('discoveryDocs').val();
	this.table         = snap.child('details').child('table').val();
	this.range         = snap.child('details').child('range').val();
	this.maptype       = snap.child('details').child('maptype').val();
	this.label         = snap.child('details').child('mapping').child('label').val();
	this.start         = snap.child('details').child('mapping').child('start').val();
	this.end           = snap.child('details').child('mapping').child('end').val();
	this.group         = snap.child('details').child('mapping').child('group').val();
	this.parent        = snap.child('details').child('mapping').child('parent').val();
	this.progress      = snap.child('details').child('mapping').child('progress').val();
	this.summary       = snap.child('details').child('mapping').child('summary').val();
	this.link          = snap.child('details').child('mapping').child('link').val();
	this.height        = snap.child('details').child('height').val();
	this.isSummarize   = snap.child('details').child('isSummarize').val();
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
					const project = new projectPatterns[snap.child('pattern').val()](snap);
					projects[project.name] = project;
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

function bootstrapGSheets(project, chartPlaceholders, rawData, callback) {
	gapi.load('client:auth2', () => initGSheets(project, chartPlaceholders, rawData, callback));
}

function initGSheets(project, chartPlaceholders, rawData, callback) {
	gapi.client.init({
		apiKey: project.apiKey,
		clientId: project.clientId,
		discoveryDocs: project.discoveryDocs,
		scope: project.scopes
	}).then(function () {
		gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
			updateGSheetsSigninStatus(project, chartPlaceholders, rawData, callback, isSignedIn);
		});
		let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
		updateGSheetsSigninStatus(project, chartPlaceholders, rawData, callback, isSignedIn);
	}, function (error) {
		console.log(JSON.stringify(error, null, 2));
	});
}

function updateGSheetsSigninStatus(project, chartPlaceholders, rawData, callback, isSignedIn) {
	if (isSignedIn) gSheetsReadWorker(project, chartPlaceholders, rawData, callback);
	else bootstrapGSheets(project, chartPlaceholders, rawData, callback);
}

function gSheetsReadWorker(project, chartPlaceholders, rawData, callback) {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId: project.spreadsheetId,
		range: project.table + '!' + project.range,
	}).then(
		(response) => onResult(project, chartPlaceholders, rawData, callback, response),
		onError(response));
}

function onResult(project, chartPlaceholders, rawData, callback, response) {
	var range = response.result;
	if (range.values.length > 0) {
		for (i = 0; i < range.values.length; i++) {
			var row = range.values[i];
			console.log(row[0] + ', ' + row[4]);
			with (rowData = "") {
				for (j = 0; j < row.length; j++) {
					rowData += row[j] + ',';
				}
				const rData = rowData.split(',')[0];
				rawData.push(rData);
			}
		}
	} else {
		console.log('No data found.');
	}
	callback(project, chartPlaceholders, rawData);
}

function onError(response) {
	console.log('Error: ' + response.result.error.message);
}

function readGoogleSheetsData(project, chartPlaceholders, rawData, callback) {
	bootstrapGSheets(project, chartPlaceholders, rawData, callback);
}
