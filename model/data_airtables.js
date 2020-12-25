var rawData = [];

function airtables1(project, chartPlaceholder) {
	document.getElementById(chartPlaceholder).innerHTML = project.name;
	let url = "https://api.airtable.com/v0/" + project.key + "/" + project.table;
	readAirtablesData(url, project, chartPlaceholder, rawData,
	(project, chartPlaceholder, rawData) => {
		console.log(project);
		console.log(chartPlaceholder);
		console.log(rawData);
	});
}
