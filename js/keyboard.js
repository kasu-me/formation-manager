window.addEventListener("keydown", (e) => {
	if (e.ctrlKey) {
		if (e.key == "s") {
			e.preventDefault();
			showJSONOutputDialog();
		} else if (e.key == "o") {
			e.preventDefault();
			showJSONLoadDialog();
		}
	}
});