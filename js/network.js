//オンラインバックアップ
function onlineBackUpAuth(authUrl, auth) {
	fetch(authUrl, {
		method: 'POST',
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json;charset=utf-8"
		},
		body: JSON.stringify(auth)
	}).then(response => {
		if (response.ok) {
			response.text().then(text => {
				console.log(text);
			});
		} else {
			console.log(response.status);
		}
	});
}

function onlineBackUp(url, callback) {
	if (settings.isUploadToOnlineStorage) {
		fetch(url, {
			method: 'PUT',
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": "Basic " + btoa(`${auth.user}:${auth.password}`)
			},
			body: generateJSON()
		}).then(response => {
			if (response.ok) {
				response.text().then(callback);
			} else {
				console.log(response.status);
			}
		});
	}
}
function loadListsFromOnlineBackUp(url) {
	fetch(url, {
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": "Basic " + btoa(`${auth.user}:${auth.password}`)
		}
	}).then(response => {
		if (response.ok) {
			response.text().then(text => {
				loadListsFromJSON(text);
			})
		} else {
			console.log(response.status);
		}
	});
}