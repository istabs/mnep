var rawData = [];

function prepareAirtables(project, chartPlaceholder, rawData) {
	console.log(project);
	console.log(chartPlaceholder);
	console.log(rawData);
}

function airtables1(project, chartPlaceholder) {
	document.getElementById(chartPlaceholder).innerHTML = project.name;
	let url = "https://api.airtable.com/v0/" + project.key + "/" + project.table;
	readAirtablesData(url, project, chartPlaceholder, rawData, prepareAirtables);
}
