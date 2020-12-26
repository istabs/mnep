google.charts.load('current', {	'packages': ['gantt'] });
var daysToMilliseconds = days => days * 24 * 3600000;
var ids = [];

function curryChart(chart, options) {
	return function (table) {
		chart.draw(table, options);
	};
}

function prepareTable(items) {
	var table = new google.visualization.DataTable();
	table.addColumn('string', 'Task ID');
	table.addColumn('string', 'Task Name');
	table.addColumn('string', 'Resource');
	table.addColumn('date', 'Start Date');
	table.addColumn('date', 'End Date');
	table.addColumn('number', 'Duration');
	table.addColumn('number', 'Percent Complete');
	table.addColumn('string', 'Dependencies');

	var i = 0;
	items.forEach(item => {
		[0, 1, 2, 7].forEach(n => {if (item[n] && Array.isArray(item[n])) item[n] = item[n][0];})
		table.addRow(item);
		ids[i++] = item[0];
	})
	return table;
}

function presentGantt(chartPlaceholder,
	options = { gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } }, height: 640, width: 960
	}, rawData, items, project) {

	var table = prepareTable(items);
	var chart = new google.visualization.Gantt(document.getElementById(chartPlaceholder));

	// setup for bars click
	google.visualization.events.addListener(chart, 'select',
		e => {
			var id = ids[chart.getSelection()[0].row];
			console.log(id)
			prepareAirtables2(project, chartPlaceholder, rawData, a => a === id)
		}
	);
	chart.draw(table, options)
}

function prepareAirtables2(project, chartPlaceholder, rawData, rule) {
	var rows = [];
	rawData.sort((a, b) => Date.parse(a.fields.Inicio[0]) - Date.parse(b.fields.Inicio[0])).forEach(item => {
		console.log(Array.isArray(item.fields['Predecessores']) ? item.fields['Predecessores'][0] : item.fields['Predecessores'])
		if (rule(item['id']) || rule(Array.isArray(item.fields['Predecessores']) ? item.fields['Predecessores'][0] : item.fields['Predecessores'])) {
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