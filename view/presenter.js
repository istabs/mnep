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

function presentGantt(chartPlaceholders,
	options = { gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } }, height: 640, width: 960
	}, rawData, items, project) {

	var table = prepareTable(items);
	var chart = new google.visualization.Gantt(document.getElementById(chartPlaceholders.chart));

	// setup for bars click
	google.visualization.events.addListener(chart, 'select',
		e => {
			var id = ids[chart.getSelection()[0].row];
			var group = "";
			rawData.forEach(item => {
				if (item['id'] === id) {
					group = item.fields[project.group];
				}
			})
			prepareAirtablesDetails(project, chartPlaceholders, rawData, id,
				a => a.fields[project.group] === group)
		}
	);
	google.visualization.events.addListener(chart, 'ready', e => window.scrollTo(0, 0));
	chart.draw(table, options)
}

var rows = [];
var curriedPresentGantt = ()=>{alert('original stuff!!!')};

function prepareAirtables(project, chartPlaceholders, rawData) {
	rawData.sort((a, b) => Date.parse(a.fields.Inicio[0]) - Date.parse(b.fields.Inicio[0])).forEach(item => {
		if (! project.isSummarize || (project.isSummarize && project.summary && item.fields[project.summary])) {
			let actvEnd = new Date(item.fields[project.end])
			let progress = project.progress ? (item.fields[project.progress] ? item.fields[project.progress] : 0) : 0;
			//let preds = project.parent ? (item.fields[project.parent] ? item.fields[project.parent][0] : null) : null;
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
					null, // Dependencies (string / comma separated)
				]);
			}
		}
	});
	curriedPresentGantt = () => presentGantt(chartPlaceholders,
		{ gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
		height: project.height * 42 + 40, width: 960 }, rawData, rows, project);
	curriedPresentGantt();
	/*
	presentGantt(chartPlaceholders,
		{ gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
		height: project.height * 42 + 40, width: 960 }, rawData, rows, project);
	*/
}

function prepareGroupLabels(rawData, project) {
	let groupLabels = {};
	rawData.forEach(item => groupLabels[item['id']] = item.fields[project.label]);
	return groupLabels;
}

function prepareAirtablesDetails(project, chartPlaceholders, rawData, id, rule) {
	var rows = [];
	let groupLabels = prepareGroupLabels(rawData, project);
	rawData.sort((a, b) => Date.parse(a.fields.Inicio[0]) - Date.parse(b.fields.Inicio[0])).forEach(item => {
		if (rule(item)) {
			let group = item.fields[project.parent] ? (item.fields[project.parent][0] === id ? groupLabels[item['id']] : groupLabels[item.fields[project.parent][0]]) : "";
			let actvEnd = new Date(item.fields[project.end])
			actvEnd.setDate(actvEnd.getDate() + 1)
			let progress = project.progress ? (item.fields[project.progress] ? item.fields[project.progress] : 0) : 0;
			//let preds = project.parent ? (item.fields[project.parent] ? item.fields[project.parent][0] : null) : null;
			if (item.fields[project.start] && item.fields[project.end]) {
				rows.push([
					item.id, // Task ID
					item.fields[project.label], // Task Name
					group, // Group (string)
					new Date(item.fields[project.start]), // Start Date
					actvEnd, // End Date
					0, // Duration (number)
					progress, // Percent Complete (number)
					null, // Dependencies (string / comma separated)
				]);
			}
		}
	});
	document.getElementById(chartPlaceholders.title).innerHTML = "<a onclick='curriedPresentGantt()'>" + project.name + "</a>"
	document.getElementById(chartPlaceholders.subtitle).textContent = groupLabels[id];
	presentGantt(chartPlaceholders,
		{ gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
		height: project.height * 42 + 40, width: 960 }, rawData, rows, project);
}

function airtables1(project, chartPlaceholders) {
	document.getElementById(chartPlaceholders.chart).innerHTML = "";
	document.getElementById(chartPlaceholders.title).textContent = project.name;
	document.getElementById(chartPlaceholders.subtitle).textContent = "";
	let url = "https://api.airtable.com/v0/" + project.key + "/" + project.table;
	readAirtablesData(url, project, chartPlaceholders, rawData, prepareAirtables);
}

var parsers = {
	"AirTables:airtables1": airtables1,
}
