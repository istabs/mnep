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

var resources = {};

function presentGantt(chartPlaceholders,
	options = { gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } }, height: 640, width: 960
	}, rawData, items, project) {

	var table = prepareTable(items);
	var chart = new google.visualization.Gantt(document.getElementById(chartPlaceholders.chart));

	var resources = {};
	rawData.forEach(item => resources[item['id']] = item);

	// setup for bars click
	google.visualization.events.addListener(chart, 'select',
		e => {
			if (chart.getSelection().length == 0) {
				return;
			};
			var id = ids[chart.getSelection()[0].row];
			if (resources[id] && project.link && resources[id].fields[project.link]) {
					placeholdersMarshal = JSON.stringify(chartPlaceholders);
				menuChoice(resources[id].fields[project.link], placeholdersMarshal);
				return;
			}
			var group = resources[id].fields[project.group];
			prepareAirtablesDetails(project, chartPlaceholders, rawData, id,
				a => a.fields[project.group] === group)
		}
	);
	google.visualization.events.addListener(chart, 'ready', e => window.scrollTo(0, 0));
	chart.draw(table, options)
}

var rows = [];
var curriedPresentGantt = ()=>{alert('Não foi encontrada qualquer informação acessível pelo utilizador.')};

function prepareAirtables(project, chartPlaceholders, rawData) {
	rows = [];
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
	curriedPresentGantt = () => {
		document.getElementById(chartPlaceholders.subtitle).textContent = "";
		document.getElementById(chartPlaceholders.backBtn).style.display = "none";
		presentGantt(chartPlaceholders,
		{ gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
		height: Math.max(project.height, rows.length) * 42 + 50, width: 960 }, rawData, rows, project);
	}
	curriedPresentGantt();
	/*
	presentGantt(chartPlaceholders,
		{ gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
		height: project.height * 42 + 40, width: 960 }, rawData, rows, project);
	*/
}

function prepareGsheets(project, chartPlaceholders, rawData) {
	rows = [];
	rawData.sort((a, b) => Date.parse(a.start) - Date.parse(b.start)).forEach(item => {
		if (! project.isSummarize || (project.isSummarize && project.summary && item[project.summary])) {
			let actvEnd = new Date(item['end'])
			let progress = project.progress ? (item['progress'] ? item['progress'] : 0) : 0;
			//let preds = project.parent ? (item[project.parent] ? item[project.parent][0] : null) : null;
			actvEnd.setDate(actvEnd.getDate() + 1)
			if (item['start'] && item['end']) {
				rows.push([
					item['id'], // Task ID
					item['name'], // Task Name
					item['group'], // Group (string)
					new Date(item['start']), // Start Date
					actvEnd, // End Date
					0, // Duration (number)
					parseFloat(progress), // Percent Complete (number)
					null, // Dependencies (string / comma separated)
				]);
			}
		}
	});
	curriedPresentGantt = () => {
		document.getElementById(chartPlaceholders.subtitle).textContent = "";
		document.getElementById(chartPlaceholders.backBtn).style.display = "none";
		presentGantt(chartPlaceholders,
		{
			gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
			height: project.height * 42 + 50, width: 960
		},
		rawData, rows, project);
	}
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
	document.getElementById(chartPlaceholders.backBtn).style.display = "inline"
	document.getElementById(chartPlaceholders.subtitle).textContent = groupLabels[id];
	presentGantt(chartPlaceholders,
		{ gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } },
		height: project.height * 42 + 40, width: 960 }, rawData, rows, project);
}

function airtablesCommon(project, chartPlaceholders, url) {
	document.getElementById(chartPlaceholders.chart).innerHTML = "";
	document.getElementById(chartPlaceholders.title).textContent = project.name;
	document.getElementById(chartPlaceholders.subtitle).textContent = "";
	document.getElementById(chartPlaceholders.backBtn).style.display = "none";
	readAirtablesData(url, project, chartPlaceholders, rawData, prepareAirtables);
}

function airtables1(project, chartPlaceholders) {
	let url = new URL("/v0/" + project.key + "/" + project.table, "https://api.airtable.com");
	airtablesCommon(project, chartPlaceholders, url);
}

function airtables2(project, chartPlaceholders) {
	let url = new URL("/v0/" + project.key + "/" + project.table, "https://api.airtable.com");
	if (project.view) url.searchParams.append("view", project.view);
	airtablesCommon(project, chartPlaceholders, url);
}

function gsheets1(project, chartPlaceholders) {
	document.getElementById(chartPlaceholders.chart).innerHTML = "";
	document.getElementById(chartPlaceholders.title).textContent = project.name;
	document.getElementById(chartPlaceholders.subtitle).textContent = "";
	document.getElementById(chartPlaceholders.backBtn).style.display = "none";
	let url = project.url;
	readGoogleSheetsData(project, chartPlaceholders, rawData, prepareGsheets);
}

var parsers = {
	"AirTables:airtables1": airtables1,
	"AirTables:airtables2": airtables2,
	"GoogleSheets:gsheets1": gsheets1
}
