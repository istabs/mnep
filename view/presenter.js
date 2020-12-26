
function prepareAirtables(project, chartPlaceholder, rawData) {
	var rows = [];
	rawData.sort((a, b) => Date.parse(a.fields.Inicio[0]) - Date.parse(b.fields.Inicio[0])).forEach(item => {
		if (! project.isSummarize || (project.isSummarize && project.summary && item.fields[project.summary])) {
			let actvEnd = new Date(item.fields[project.end])
			let progress = project.progress ? (item.fields[project.progress] ? item.fields[project.progress] : 0) : 0;
			let preds = project.parent ? (item.fields[project.parent] ? item.fields[project.parent][0] : null) : null;
			actvEnd.setDate(actvEnd.getDate() + 1)
			if (item.fields[project.start] && item.fields[project.end]) {
				rows.push([
					item.id, // Task ID
					item.fields[project.label], // Task Name
					item.fields[project.group], // Group (string)
					new Date(item.fields[project.start]), // Start Date
					actvEnd, // End Date
					0, // Duration (number)
					progress, // Percent Complete (number)
					preds, // Dependencies (string / comma separated)
				]);
			}
		}
	});
	presentGantt(chartPlaceholder,
		{ gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
		height: project.height * 42 + 40, width: 960 }, rawData, rows, project);
}

function airtables1(project, chartPlaceholder) {
	document.getElementById('chart_title').textContent = project.name;
	let url = "https://api.airtable.com/v0/" + project.key + "/" + project.table;
	readAirtablesData(url, project, chartPlaceholder, rawData, prepareAirtables);
}

var parsers = {
	"AirTables:airtables1": airtables1,
}
