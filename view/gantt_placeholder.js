google.charts.load('current', {
	'packages': ['gantt']
});
var daysToMilliseconds = days => days * 24 * 3600000;
var ids = [];

function curryChart(chart, options) {
	return function (table) {
		chart.draw(table, options);
	};
}

function presentGantt1(htmlTag,
	options = {
		gantt: {
			criticalPathEnabled: true,
			criticalPathStyle: {
				stroke: '#e64a19',
			},
			arrow: {
				radius: 10
			}
		},
		height: 640,
		width: 960
	}, rawData, table) {
	var chart = new google.visualization.Gantt(document.getElementById(htmlTag));
	var curriedViewer = curryChart(chart, options);
	google.visualization.events.addListener(chart, 'select',
		e => {
			var id = ids[chart.getSelection()[0].row];
			googleChartAirtableAdapt(rawData, _.partial(detailsAdapter, id), curriedViewer)
		}
	);
	curriedViewer(table);
}

function presentGantt(htmlTag,
	options = { gantt: { criticalPathEnabled: true, criticalPathStyle: { stroke: '#e64a19', }, arrow: { radius: 10 } }, height: 640, width: 960
	}, rawData, items) {

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
			table.addRow(item);
			ids[i++] = item[0];
		})

		var chart = new google.visualization.Gantt(document.getElementById(htmlTag));
		var curriedViewer = curryChart(chart, options);
		google.visualization.events.addListener(chart, 'select',
			e => {
				var id = ids[chart.getSelection()[0].row];
				googleChartAirtableAdapt(rawData, _.partial(detailsAdapter, id), curriedViewer)
			}
		);
		curriedViewer(table);
}

function googleChartAirtableAdapt(airtableData, airTableAdapter, viewer) {
	airTableAdapter(airtableData, items => {
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
			table.addRow(item);
			ids[i++] = item[0];
		})
		viewer(table);
	});
}