window.addEventListener("load", () => {
	let balloon = document.createElement("div");
	balloon.id = "mku-balloon";
	document.body.appendChild(balloon);
	document.querySelectorAll(".mku-balloon").forEach((elem) => {
		let message = elem.getAttribute("balloon-message");
		elem.addEventListener("mouseenter", (e) => {
			balloon.innerHTML = message;
			balloon.style.top = `${elem.getBoundingClientRect().bottom + 10 + window.scrollY}px`;
			balloon.style.left = `${(elem.getBoundingClientRect().left + elem.getBoundingClientRect().right) / 2 - 20}px`;
			balloon.classList.add("on");
		});
		elem.addEventListener("mouseleave", (e) => {
			balloon.classList.remove("on");
			balloon.innerHTML = "";
			balloon.style.top = 0;
			balloon.style.left = 0;
		});
	});
});