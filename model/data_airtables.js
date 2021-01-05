var projects = {};

var rawData = [];

function Project(snap) {
	this.name          = snap.child('name').val();
	this.pattern       = snap.child('pattern').val();
	this.authorization = snap.child('credentials').child('authorization').val();
	this.key           = snap.child('credentials').child('key').val();
	this.table         = snap.child('details').child('table').val();
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
	this.url           = snap.child('credentials').child('url').val();
	this.clientId      = snap.child('credentials').child('clientId').val();
	this.secret        = snap.child('credentials').child('secret').val();
}

function MngdUser(user) {
	this.name = user.name;
	this.email = user.email;
	this.key = user.email.replace(new RegExp('\\.','g'), '%2E');
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
				}).then(()=>callback(projectsLst));
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

function handleTqResponse(resp) {
	//document.write(JSON.stringify(resp));
	console.log(resp);
}

function makeApiCall(url) {
	// Note: The below spreadsheet is "Public on the web" and will work
	// with or without an OAuth token.  For a better test, replace this
	// URL with a private spreadsheet.
	var tokenToken = gapi.auth.getToken();
	var token = tokenToken.getToken();
	var tqUrl = url + '/gviz/tq' +
		'?tqx=responseHandler:handleTqResponse' +
		'&access_token=' + encodeURIComponent(gapi.auth.getToken().access_token);

	document.write('<script src="' + tqUrl +'" type="text/javascript"></script>');
}

var url="";

function handleAuthResult(authResult) {
	makeApiCall(url);
}

function readGoogleSheetsData(url_, project, chartPlaceholders, acc, callback) {
	url = url_;
	var clientId = project.clientId;
	var scopes = 'https://www.googleapis.com/auth/spreadsheets';
	/*
	gapi.auth.authorize(
		{client_id: clientId, scope: scopes, immediate: true},
		handleAuthResult);
	*/
	makeApiCall(url);

	/*
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
	*/
}
