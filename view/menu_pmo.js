function menuChoice(project, marshaledChartPlaceholders) {
	let chartPlaceholders = JSON.parse(marshaledChartPlaceholders);
	fillChart(project, chartPlaceholders);
}

function completeMenu(projectsLst, chartPlaceholders, dropdownTag) {
	let dropdownLinks = "";
	projectsLst.forEach(project => {
		let prjName = project.name;
		placeholdersMarshal = escapeHtml(JSON.stringify(chartPlaceholders));
		dropdownLinks += "<a class='dropdown-item' href='#' onclick=\"menuChoice('" + project.name + "','"
		+ placeholdersMarshal + "')\">" + project.name + "</a>"
	});
	document.getElementById(dropdownTag).innerHTML = dropdownLinks
}

function handleSignedInUser(user) {
	// Adjust menu bar
	document.getElementById('user-id').style.display = 'block';
	document.getElementById('user-id').textContent = user.displayName;
	if (user.photoURL) {
		var photoURL = user.photoURL;
		if ((photoURL.indexOf('googleusercontent.com') != -1) ||
			(photoURL.indexOf('ggpht.com') != -1)) {
			photoURL = photoURL + '?sz=' + '40';
		}
		document.getElementById('photo').src = photoURL;
		document.getElementById('photo').style.display = 'block';
	} else {
		document.getElementById('photo').style.display = 'none';
		document.getElementById('user-id').style.display = 'none';
	}
	// Dynamic fulfilment
	let mngdUser = new MngdUser(user);
	let chart_placeholders = {chart: "chart_placeholder", title: "chart-title_placeholder", subtitle: "chart-subtitle_placeholder", backBtn: "backBtn"}
	mngdUser.onDefault(project => fillChart(project, chart_placeholders));
	mngdUser.onMenu(projects => completeMenu(projects, chart_placeholders, 'dropdown-menu_placeholder'));
};

function handleSignedOutUser() {
	document.getElementById('photo').style.display = 'none';
	document.getElementById('user-id').style.display = 'none';
	window.open('.', '_self');
};
