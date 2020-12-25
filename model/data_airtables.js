
function prepareAirtables(project, chartPlaceholder, rawData) {
	var rows = [];
	console.log(rawData);
	rawData.sort((a, b) => Date.parse(a.fields.Inicio[0]) - Date.parse(b.fields.Inicio[0])).forEach(item => {
		if (item.fields["Sumário"]) {
			var preds = item.fields.Predecessores ? item.fields.Predecessores[0] : null;
			var fim = new Date(item.fields["Fim"])
			fim.setDate(fim.getDate() + 1)
			if (item.fields.Inicio && item.fields.Fim) {
				rows.push([
					item.id, // Task ID
					item.fields["Atividade"], // Task Name
					item.fields["Classificação"], // Group (string)
					new Date(item.fields["Inicio"]), // Start Date
					fim, // End Date
					0, // Duration (number)
					0, // Percent Complete (number)
					preds, // Dependencies (string / comma separated)
				]);
			}
		}
	});
	console.log(rows);
}

function airtables1(project, chartPlaceholder) {
	document.getElementById(chartPlaceholder).innerHTML = project.name;
	let url = "https://api.airtable.com/v0/" + project.key + "/" + project.table;
	readAirtablesData(url, project, chartPlaceholder, rawData, prepareAirtables);
}
