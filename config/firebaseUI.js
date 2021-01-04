const firebaseUiConfig = {
	signInSuccessUrl: 'pmo.html',
	signInOptions: [
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		//firebase.auth.TwitterAuthProvider.PROVIDER_ID,
		//firebase.auth.GithubAuthProvider.PROVIDER_ID,
		{
			provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
			signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,

		},
	],
	// tosUrl and privacyPolicyUrl accept either url string or a callback
	// function.
	// Terms of service url/callback.
	//tosUrl: '<your-tos-url>',
	// Privacy policy url/callback.
	//privacyPolicyUrl: function () {
		//window.location.assign('<your-privacy-policy-url>');
	//},
};
