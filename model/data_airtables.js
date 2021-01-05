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
	/*
	var tokenToken = gapi.auth2.getToken();
	var tqUrl = url + '/gviz/tq' +
		'?tqx=responseHandler:handleTqResponse' +
		'&access_token=' + encodeURIComponent(gapi.auth.getToken().access_token);

	document.write('<script src="' + tqUrl +'" type="text/javascript"></script>');
	*/
}

var url="";

function handleAuthResult(authResult) {
	makeApiCall(url);
}

function ginit() {
/*	gapi.load('auth2', function() {
		/* Ready. Make a call to gapi.auth2.init or some other API */
/*		url = 'https://docs.google.com/spreadsheets/d/19D2cU8pCGkN4sl5DDXjLlYbd8LoNDHKmEJJ7l2cs1lY';
		var clientId = '1027876211335-93p0ngrnrnb2tmt8hbadhchvj77r23kf.apps.googleusercontent.com';
		var scopes = 'https://www.googleapis.com/auth/spreadsheets';
		gapi.auth.authorize(
			{client_id: clientId, scope: scopes, immediate: true},
			handleAuthResult);
	});
*/
	url = 'https://docs.google.com/spreadsheets/d/19D2cU8pCGkN4sl5DDXjLlYbd8LoNDHKmEJJ7l2cs1lY';
	var clientId = '1027876211335-93p0ngrnrnb2tmt8hbadhchvj77r23kf.apps.googleusercontent.com';
	var scopes = 'https://www.googleapis.com/auth/spreadsheets';
	gapi.auth2.init({client_id: clientId, scope: scopes, immediate: true})
	.then(handleAuthResult, function(error) {
		console.log(error.message);
	});
/*
	gapi.auth2.authorize(
		{client_id: clientId, scope: scopes, immediate: true},
		handleAuthResult);
*/
}

function readGoogleSheetsData(url, project, chartPlaceholders, acc, callback) {
	/*
	url = url_;
	var clientId = project.clientId;
	var scopes = 'https://www.googleapis.com/auth/spreadsheets';
	gapi.auth2.authorize( {client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
	*/
	var createCORSRequest = function(method, url) {
		var xhr1 = new XMLHttpRequest();
		if ("withCredentials" in xhr1) {
		  // Most browsers.
		  xhr1.open(method, url, true);
		} else if (typeof XDomainRequest != "undefined") {
		  // IE8 & IE9
		  xhr1 = new XDomainRequest();
		  xhr1.open(method, url);
		} else {
		  // CORS not supported.
		  xhr1 = null;
		}
		return xhr1;
	};
	
	var url = 'https://docs.google.com/spreadsheets/d/19D2cU8pCGkN4sl5DDXjLlYbd8LoNDHKmEJJ7l2cs1lY';
	var method = 'GET';
/*
	var xhr2 = createCORSRequest(method, url);
	
	xhr2.onload = function(data) {
		// Success code goes here.
		console.log(data)
	};
	
	xhr2.onerror = function(error) {
		// Error code goes here.
		console.log(error)
	};
	
	xhr2.withCredentials = true;
	//xhr2.send();
*/

	window.googleDocCallback = function () { return true; };
	var key = "1Cj1SSI-GHCRhIAK-LYurwVrE0FOyOJTpUnoHNNPieYo",  // key for demo spreadsheet
    query = "&tqx=out:csv",                       // query returns the first sheet as CSV
    url = "https://spreadsheets.google.com/tq?key=" + key + query;  // CORS-enabled server

	$.ajax({
		url: url + '?callback=googleDocCallback',
		/*
		beforeSend: (xhr) => {
			xhr.setRequestHeader("Authorization", project.authorization);
			//xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		},
		*/
		//crossDomain: true,
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
}
