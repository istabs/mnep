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
		if (item[0] && Array.isArray(item[0])) item[0] = item[0][0];
		if (item[0] && Array.isArray(item[1])) item[1] = item[1][0];
		if (item[0] && Array.isArray(item[2])) item[2] = item[2][0];
		if (item[0] && Array.isArray(item[7])) item[7] = item[7][0];
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
				googleChartAirtableAdapt(rawData, _.partial(detailsAdapter, id), curriedViewer)
			}
		);
		chart.draw(table, options)
}
