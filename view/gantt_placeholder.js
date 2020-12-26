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

function presentGantt(htmlTag,
	options = { gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } }, height: 640, width: 960
	}, rawData, items) {

		var table = prepareTable(items);
		var chart = new google.visualization.Gantt(document.getElementById(htmlTag));

		// setup for bars click
		google.visualization.events.addListener(chart, 'select',
			e => {
				var id = ids[chart.getSelection()[0].row];
				presentGantt(htmlTag, options, rawData, filterByParent(rawData, id))
			}
		);
		chart.draw(table, options)
}

// An AirTable table adapter for Google Charts
function detailsAdapter(id, rawData, presenter, options={chart_subtitle: 'chart_subtitle'}) {
	var rows = []
	var classificacao = ""
	var summary = ""
	var classifications = {}
	const SUMARIO = ': Sumário'
	rawData.records.forEach(item => {
		if (item.id === id) {
			classificacao = item.fields["Classificação"];
			if (item.fields && item.fields["Atividade"] && item.fields["Atividade"].includes(SUMARIO)) {
				document.getElementById(options.chart_subtitle).textContent = item.fields["Atividade"].replace(SUMARIO,'');
				summary = item.id
			}
		}
		classifications[item.id] = item.fields.Atividade;
	})
	rawData.records.forEach(item => {
		if (item.id === id || (item.fields["Classificação"] && item.fields["Classificação"] === classificacao)) {
			if (item.fields.Inicio && item.fields.Fim) {
				let fim = new Date(item.fields["Fim"])
				fim.setDate(fim.getDate() + 1)
				let classification = '';
				if (item.fields.Predecessores && item.fields.Predecessores[0]) {
					classification = classifications[item.fields.Predecessores[0]]
					if (classification.includes(SUMARIO)) {
						classification = classifications[item.id]
					}
				}
				rows.push([
					item.id, // Task ID
					item.fields["Atividade"], // Task Name
					classification,
					new Date(item.fields["Inicio"]), // Start Date
					fim, // End Date
					0, // Duration
					item.fields["Progresso"], // Percent Complete
					null, // Dependencies
				]);
			} else {
				console.log('missing date on ' + item.id + ', ' + item.fields.Atividade)
			}
		}
	});
	presentGantt(rows);
}

