function synchMenu(status) {
	document.getElementById('gantts').style.display = status;
	document.getElementById('user-id').style.display = status;
	document.getElementById('photo').style.display = status;
	document.getElementById('canvas_photo').style.display = status;
	document.getElementById('canvas_name').style.display = status;
}

var handleSignedInUser = function (user) {
	document.getElementById('firebaseui-auth-container').style.display = 'none';
	with(status = 'block') {
		document.getElementById('user-id').textContent = user.displayName;
		document.getElementById('canvas_name').textContent = user.displayName;
		if (user.photoURL) {
			var photoURL = user.photoURL;
			var canvasPhotoURL = user.photoURL;
			if ((photoURL.indexOf('googleusercontent.com') != -1) ||
				(photoURL.indexOf('ggpht.com') != -1)) {
				canvasPhotoURL = photoURL;
				photoURL = photoURL + '?sz=' + '40';
			}
			document.getElementById('photo').src = photoURL;
			document.getElementById('canvas_photo').src = canvasPhotoURL;
		} else {
			status = 'none';
		}
		synchMenu(status);
	}
};

var handleSignedOutUser = function () {
	document.getElementById('firebaseui-auth-container').style.display = 'block';
	synchMenu('none');
};
