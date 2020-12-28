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
