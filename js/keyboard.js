window.addEventListener("keydown", (e) => {
	if (e.ctrlKey && e.key == "s") {
		e.preventDefault();
		showJSONOutputDialog();
	}
});