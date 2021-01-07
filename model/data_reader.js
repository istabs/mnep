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
		response => onResult(project, chartPlaceholders, rawData, callback, response),
		response => onError(response));
}

class GSheetsCtrRecord {

	constructor (record) {
		this.row = ["id", "name", "group", "start", "end", "duration", "progress", "predecessor", "isSummary", "link",];

		this.reci = {};
		this.reci["id"] = record.findIndex(item => item === "ID");
		this.reci["name"] = record.findIndex(item => item === "Descrição");
		this.reci["start"] = record.findIndex(item => item === "Inicio");
		this.reci["duration"] = record.findIndex(item => item === "Duração");
		this.reci["end"] = record.findIndex(item => item === "Fim");
		this.reci["group"] = record.findIndex(item => item === "Grupo");
		this.reci["predecessor"] = record.findIndex(item => item === "Predecessor");
		this.reci["progress"] = record.findIndex(item => item === "Progresso");
		this.reci["isSummary"] = record.findIndex(item => item === "Sumário");
		this.reci["link"] = record.findIndex(item => item === "Link");

		this.reco = {};
		this.reco["ID"] = record.findIndex(item => item === "ID");
		this.reco["Descrição"] = record.findIndex(item => item === "Descrição");
		this.reco["Inicio"] = record.findIndex(item => item === "Inicio");
		this.reco["Duração"] = record.findIndex(item => item === "Duração");
		this.reco["Fim"] = record.findIndex(item => item === "Fim");
		this.reco["Grupo"] = record.findIndex(item => item === "Grupo");
		this.reco["Predecessor"] = record.findIndex(item => item === "Predecessor");
		this.reco["Progresso"] = record.findIndex(item => item === "Progresso");
		this.reco["Sumário"] = record.findIndex(item => item === "Sumário");
		this.reci["Link"] = record.findIndex(item => item === "Link");

		this.recm = {};
		this.recm["id"] = "ID";
		this.recm["name"] = "Descrição";
		this.recm["start"] = "Inicio";
		this.recm["duration"] = "Duração";
		this.recm["end"] = "Fim";
		this.recm["group"] = "Grupo";
		this.recm["predecessor"] = "Predecessor";
		this.recm["progress"] = "Progresso";
		this.recm["isSummary"] = "Sumário";
		this.recm["link"] = "Link";

		this.recr = {};
		this.recr["ID"] = "id";
		this.recr["Descrição"] = "name";
		this.recr["Inicio"] = "start";
		this.recr["Duração"] = "duration";
		this.recr["Fim"] = "end";
		this.recr["Grupo"] = "group";
		this.recr["Predecessor"] = "predecessor";
		this.recr["Progresso"] = "progress";
		this.recr["Sumário"] = "isSummary";
		this.recr["Link"] = "link";

		this.recd = {};
		this.recd["id"] = "id";
		this.recd["name"] = "name";
		this.recd["start"] = "start";
		this.recd["duration"] = "duration";
		this.recd["end"] = "end";
		this.recd["group"] = "group";
		this.recd["predecessor"] = "predecessor";
		this.recd["progress"] = "progress";
		this.recd["isSummary"] = "isSummary";
		this.recd["link"] = "link";

		this.parseRecord = function (record) {
			let parsedRecord = {};
			this.row.forEach(key => {
				parsedRecord[key] = record[this.reci[key]];
			});
			return parsedRecord;
		}
	}
}

function onResult(project, chartPlaceholders, rawData, callback, response) {
	var range = response.result.values;
	rawData = [];
	if (range.length > 0) {
		let rawRecord = new GSheetsCtrRecord(range[0]);
		for (i = 1; i < range.length; i++) {
			var row = rawRecord.parseRecord(range[i]);
			console.log(row);
			rawData.push(row);
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
